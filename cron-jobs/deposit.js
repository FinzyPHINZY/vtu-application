import cron from 'node-cron';
import Transaction from '../models/Transaction.js';

console.log('Cron job file loaded');

const job = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Starting pending transaction cleanup job');

    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);
    console.log('Looking for transactions before:', cutoffTime);

    const transactions = await Transaction.find({
      status: 'pending',
      createdAt: { $lt: cutoffTime },
    });
    console.log(`Found ${transactions.length} pending transactions to process`);

    for (const txn of transactions) {
      txn.status = 'failed';
      await txn.save();
      console.log(`Transaction ${txn._id} marked as failed`);
    }

    console.log(
      `Cleanup job completed. Processed ${transactions.length} transactions`
    );
  } catch (error) {
    console.error('Error in transaction cleanup job:', error);
  }
});

job.start();

export default job;
