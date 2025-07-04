import cron from 'node-cron';
import Transaction from '../models/Transaction.js';

const PENDING_THRESHOLD_MINUTES = 60;
const CRON_SCHEDULE = '*/10 * * * *';
const TIMEZONE = 'Africa/Lagos';

// console.log('PalmPay deposit verification cron job initialized');

// async function processPendingDeposits() {
//   try {
//     console.log(
//       `[${new Date().toISOString()}] Starting deposit verification job`
//     );

//     const oneHourAgo = new Date(
//       Date.now() - PENDING_THRESHOLD_MINUTES * 60 * 1000
//     );
//     const pendingTransactions = await Transaction.find({
//       serviceType: 'deposit',
//       status: 'pending',
//       createdAt: { $lte: oneHourAgo },
//     })
//       .populate('user')
//       .lean();

//     if (!pendingTransactions.length) {
//       console.info('No deposits pending for more than 1 hour');
//       return;
//     }

//     console.log(`Found ${pendingTransactions.length} deposits pending >1 hour`);

//     for (const txn of pendingTransactions) {
//       try {
//         await Transaction.findByIdAndUpdate(txn._id, {
//           $set: {
//             status: 'failed',
//             failureReason: 'Webhook not received within 1 hour',
//             lastVerifiedAt: new Date(),
//             completedAt: new Date(),
//           },
//           $push: {
//             statusHistory: {
//               status: 'failed',
//               timestamp: new Date(),
//               reason: 'Webhook not received within 1 hour',
//             },
//           },
//         });
//         console.log(`Marked transaction ${txn._id} as failed`);
//       } catch (error) {
//         console.error(`Error processing transaction ${txn._id}:`, error);
//       }
//     }
//   } catch (error) {
//     console.error('Job execution failed:', error);
//   }
// }

async function processPendingTransactions() {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting transaction timeout check`
    );

    const oneHourAgo = new Date(
      Date.now() - PENDING_THRESHOLD_MINUTES * 60 * 1000
    );

    // Find both deposit and bank_transfer pending transactions
    const pendingTransactions = await Transaction.find({
      serviceType: { $in: ['deposit', 'bank_transfer'] },
      status: 'pending',
      createdAt: { $lte: oneHourAgo },
    }).lean();

    if (!pendingTransactions.length) {
      console.info('No transactions pending for more than 1 hour');
      return;
    }

    console.log(
      `Found ${pendingTransactions.length} transactions pending >1 hour`
    );

    for (const txn of pendingTransactions) {
      try {
        const update = {
          $set: {
            status: 'failed',
            failureReason: 'No confirmation received within 1 hour',
            lastVerifiedAt: new Date(),
            completedAt: new Date(),
          },
          $push: {
            statusHistory: {
              status: 'failed',
              timestamp: new Date(),
              reason: 'No confirmation received within 1 hour',
            },
          },
        };

        await Transaction.findByIdAndUpdate(txn._id, update);

        console.log(
          `Marked transaction ${txn._id} (${txn.serviceType}) as failed`
        );
      } catch (error) {
        console.error(`Error processing transaction ${txn._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Job execution failed:', error);
  }
}

// Initialize the cron job
const job = cron.schedule(CRON_SCHEDULE, processPendingTransactions, {
  scheduled: true,
  timezone: TIMEZONE,
});

// export const startDepositVerificationJob = () => {
//   job.start();
//   console.log('Deposit verification job scheduled');
//   return job;
// };

// export const stopDepositVerificationJob = () => {
//   job.stop();
//   console.log('Deposit verification job stopped');
// };

export const startTransactionTimeoutJob = () => {
  job.start();
  console.log('Transaction timeout job scheduled');
  return job;
};

export const stopTransactionTimeoutJob = () => {
  job.stop();
  console.log('Transaction timeout job stopped');
};
