import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

console.log('Cron job file loaded');

const job = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Starting pending transaction cleanup job');

    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);
    console.log('Looking for transactions before:', cutoffTime);

    const transactions = await Transaction.find({
      status: 'pending',
      serviceType: 'deposit',
      createdAt: { $lt: cutoffTime },
    }).populate('user');

    if (transactions.length === 0) {
      return console.info(
        `[${new Date().toISOString()}] No transactions to process`
      );
    }

    console.log(`Found ${transactions.length} pending transactions to process`);

    const failedTransactionIds = [];

    for (const txn of transactions) {
      try {
        if (!txn.virtualAccountId) {
          failedTransactionIds.push(txn._id);

          console.warn(
            `Transaction ${txn._id} marked as failed (no virtualAccountId)`
          );
          continue;
        }

        const user = txn.user;
        if (!user || !user.safeHavenAccessToken) {
          failedTransactionIds.push(txn._id);
          console.warn(`Transaction ${txn._id} failed (user or token missing)`);
          continue;
        }

        const { access_token, ibs_client_id } = user.safeHavenAccessToken;

        if (!access_token || !ibs_client_id) {
          failedTransactionIds.push(txn._id);

          console.warn(
            `Skipping transaction ${txn._id}: No Safe Haven credentials`
          );
          continue;
        }

        const response = await axios.get(
          `${process.env.SAFE_HAVEN_API_BASE_URL}/virtual-accounts/${txn.virtualAccountId}/transaction`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
              ClientID: ibs_client_id,
            },
          }
        );

        const { data } = response.data;
        console.log(data);

        if (data.status === 'Completed') {
          txn.status = 'success';
          user.accountBalance += txn.amount;

          try {
            await user.save();
            await txn.save();

            console.info(`Transaction ${txn._id} successfully processed`);
          } catch (err) {
            console.error(`Error updating user balance for ${user._id}:`, err);
          }
        }
      } catch (error) {
        console.error(`Error processing transaction ${txn._id}:`, error);
        failedTransactionIds.push(txn._id);
      }
    }

    if (failedTransactionIds.length > 0) {
      await Transaction.updateMany(
        { _id: { $in: failedTransactionIds } },
        { $set: { status: 'failed' } }
      );
      console.info(
        `Marked ${failedTransactionIds.length} transactions as failed`
      );
    }

    console.info(`[${new Date().toISOString()}] Cleanup job completed`);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in transaction cleanup job:`,
      error
    );
  }
});

job.start();

export default job;
