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
      return null;
    }

    return 3000;
  },
});

export const disableVAQueue = new Queue('disableVAQueue', { connection });

export const disableVAEvent = new QueueEvents('disableVAQueue', { connection });

disableVAEvent.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with error ${failedReason}`);
});

disableVAEvent.on('waiting', (job) => {
  console.log(`A job with ID ${job.jobId} is waiting`);
});

disableVAEvent.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed`);
  // Called every time a job is completed in any worker
});

export default disableVAQueue;
