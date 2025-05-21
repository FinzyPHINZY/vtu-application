import disableVAQueue, { disableVAEvent } from '../queues/disableVAQueue.js';
import { disableVAWorker } from './disableVAWorker.js';
import verificationQueue, {
  verificationEvent,
} from '../queues/verificationQueue.js';
import { verificationWorker } from './verificationWorker.js';

export const startQueues = async () => {
  await disableVAQueue.waitUntilReady();
  await verificationQueue.waitUntilReady();
  await disableVAWorker.waitUntilReady();
  await verificationWorker.waitUntilReady();
  await disableVAEvent.waitUntilReady();
  await verificationEvent.waitUntilReady();
  console.log('Queues and workers are ready!');
};

export const stopQueues = async () => {
  await disableVAWorker.close();
  await verificationWorker.close();
  await disableVAQueue.close();
  await verificationQueue.close();
  console.info('Queues and workers closed!');
};
