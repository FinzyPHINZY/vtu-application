import Queue from "bull";
import { config } from "dotenv";

config();

const disableVAQueue = new Queue("disableVAQueue", {
	redis: {
		host: process.env.REDIS_HOST || "127.0.0.1",
		port: process.env.REDIS_PORT || 6379,
	},
	settings: {
		maxStalledCount: 5,
		stalledInterval: 30000,
	},
	defaultJobOptions: {
		attempts: 5,
		backoff: {
			type: "exponential",
			delay: 1000,
		},
		removeOnComplete: true,
		removeOnFail: false,
	},
});

export default disableVAQueue;
