import { Queue, QueueEvents } from "bullmq";
import { config } from "dotenv";
import IORedis from "ioredis";

config();

export const connection = new IORedis("redis://127.0.0.1:6379", {
	enableOfflineQueue: false,
	offlineQueue: false,
	maxRetriesPerRequest: null,
	retryStrategy: (times) => {
		if (times > 10) {
			console.log("REDIS: failed to connect arter 10 tries");
			return null;
		}

		return 3000;
	},
});

export const disableVAQueue = new Queue("disableVAQueue", { connection });

export const disableVAEvent = new QueueEvents("disableVAQueue", { connection });
disableVAEvent.on("failed", ({ jobId, failedReason }) => {
	logger.error(`Job ${jobId} failed with error ${failedReason}`);
});

disableVAEvent.on("waiting", (job) => {
	// console.log(`A job with ID ${jobId} is waiting`);
});

disableVAEvent.on("completed", ({ jobId, returnvalue }) => {
	console.log(`Job ${jobId} completed`, returnvalue);
	// Called every time a job is completed in any worker
});

export default disableVAQueue;
