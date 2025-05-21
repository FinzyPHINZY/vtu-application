import { Queue, QueueEvents } from 'bullmq';
import { config } from 'dotenv';
import IORedis from 'ioredis';

config();

export const connection = new IORedis(process.env.REDIS_URL, {
  enableOfflineQueue: true,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) {
      console.log('REDIS: failed to connect arter 10 tries');
    }

    return 3000;
  },
});

export const verificationQueue = new Queue('verificationQueue', {
  connection,
});

export const verificationEvent = new QueueEvents('verificationQueue', {
  connection,
});

verificationEvent.on('failed', ({ jobId, failedReason }) => {
  console.error(`Verification Job ${jobId} failed with error ${failedReason}`);
});

verificationEvent.on('waiting', (job) => {
  console.log(`A verification job with ID ${job.jobId} is waiting`);
});

verificationEvent.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Verification Job ${jobId} completed`);
});

export default verificationQueue;
