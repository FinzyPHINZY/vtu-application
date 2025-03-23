import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

console.log('Cron job file loaded');

function updateTransactionStatus(txn, newStatus, reason = null) {
  // Store the previous status
  const previousStatus = txn.status;

  // Only record if status is changing
  if (previousStatus !== newStatus) {
    // Update current status
    txn.status = newStatus;

    // Add entry to status history
    txn.statusHistory = txn.statusHistory || [];
    txn.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      reason: reason || `Changed from ${previousStatus} to ${newStatus}`,
    });

    // If transaction is now in a terminal state, record completion time
    if (newStatus === 'success' || newStatus === 'failed') {
      txn.completedAt = new Date();

      // Calculate processing time in milliseconds
      if (txn.createdAt) {
        txn.processingTime =
          txn.completedAt.getTime() - txn.createdAt.getTime();
      }
    }
  }

  return txn;
}

// Run every 5 seconds
const job = cron.schedule('*/5 * * * * *', async () => {
  try {
    console.log('Starting transaction verification job');

    // Find all pending deposit transactions
    const pendingTransactions = await Transaction.find({
      status: 'pending',
      serviceType: 'deposit',
      // Add a maximum age to prevent checking very old transactions forever
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    }).populate('user');

    if (pendingTransactions.length === 0) {
      return console.info(
        `[${new Date().toISOString()}] No pending transactions to process`
      );
    }

    console.log(
      `Found ${pendingTransactions.length} pending transactions to check`
    );

    // Process each transaction
    for (const txn of pendingTransactions) {
      try {
        txn.lastVerifiedAt = new Date();

        // Calculate how long this transaction has been pending
        const txnAge = Date.now() - txn.createdAt.getTime();
        const txnAgeMinutes = Math.floor(txnAge / (60 * 1000));
        const txnAgeSeconds = Math.floor((txnAge % (60 * 1000)) / 1000);

        console.log(
          `Transaction ${txn._id} has been pending for ${txnAgeMinutes}m ${txnAgeSeconds}s`
        );

        // Check for required fields
        if (!txn.virtualAccountId) {
          console.warn(
            `Transaction ${txn._id} marked as failed (no virtualAccountId)`
          );

          txn.failureReason = 'Missing virtual account ID';
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          await txn.save();
          continue;
        }

        const user = txn.user;
        if (!user || !user.safeHavenAccessToken) {
          console.warn(`Transaction ${txn._id} failed (user or token missing)`);

          txn.failureReason = 'User authentication issue';
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          await txn.save();
          continue;
        }

        const { access_token, ibs_client_id } = user.safeHavenAccessToken;
        if (!access_token || !ibs_client_id) {
          console.warn(
            `Skipping transaction ${txn._id}: No Safe Haven credentials`
          );

          txn.failureReason = 'Missing Safe Haven credentials';
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          await txn.save();
          continue;
        }

        // Check transaction status with API
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

        if (!data) {
          console.log('still pending');
          continue;
        }

        console.log(`Transaction ${txn._id} status from API:`, data.status);

        // Handle successful transaction
        if (data.status === 'Completed') {
          updateTransactionStatus(
            txn,
            'success',
            'API returned Completed status'
          );
          user.accountBalance += txn.amount;

          try {
            await user.save();
            await txn.save();
            console.info(
              `Transaction ${txn._id} successfully processed after ${txnAgeMinutes}m ${txnAgeSeconds}s`
            );
          } catch (err) {
            console.error(`Error updating user balance for ${user._id}:`, err);
          }
          continue;
        }

        // Handle failed transaction - only fail after certain amount of time
        if (data.status === 'Failed' || data.status === 'Rejected') {
          txn.failureReason = `API returned status: ${data.status}`;
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          await txn.save();
          console.warn(
            `Transaction ${txn._id} marked as failed by payment provider`
          );
          continue;
        }

        if (data.status && data.status !== 'pending') {
          txn.statusHistory = txn.statusHistory || [];
          txn.statusHistory.push({
            status: 'pending',
            timestamp: new Date(),
            reason: `Provider status update: ${data.status}`,
          });
        }

        // Handle transactions that have been pending too long
        // Gradually increase the timeout threshold based on amount
        let maxWaitTime = 15 * 60 * 1000; // Default: 15 minutes

        // For larger transactions, wait longer before failing
        if (txn.amount > 50000) {
          maxWaitTime = 30 * 60 * 1000; // 30 minutes for larger transactions
        }

        // If this transaction has exceeded the maximum wait time, mark as failed
        if (txnAge > maxWaitTime) {
          txn.failureReason = 'Transaction timed out';
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          await txn.save();
          console.warn(
            `Transaction ${txn._id} marked as failed (timeout after ${txnAgeMinutes}m)`
          );
        }
      } catch (error) {
        console.error(`Error processing transaction ${txn._id}:`, error);

        // Increment retry count
        txn.verificationAttempts = (txn.verificationAttempts || 0) + 1;

        txn.statusHistory = txn.statusHistory || [];
        txn.statusHistory.push({
          status: 'pending',
          timestamp: new Date(),
          reason: `Verification attempt ${txn.verificationAttempts} failed: ${error.message || 'API error'}`,
        });

        // Only mark as failed after multiple failed verification attempts
        if (txn.verificationAttempts >= 5) {
          txn.failureReason = 'Verification failed after multiple attempts';
          updateTransactionStatus(txn, 'failed', txn.failureReason);

          console.warn(
            `Transaction ${txn._id} marked as failed after ${txn.verificationAttempts} attempts`
          );
        }

        await txn.save();

        if (txn.verificationAttempts < 5) {
          console.log(
            `Transaction ${txn._id} verification failed but will retry (attempt ${txn.verificationAttempts}/5)`
          );
        }
      }
    }

    console.info(`[${new Date().toISOString()}] Verification job completed`);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in transaction verification job:`,
      error
    );
  }
});

job.start();
export default job;
