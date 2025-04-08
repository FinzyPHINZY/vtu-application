import Queue from "bull";
import { config } from "dotenv";

config();

const disableVAQueue = new Queue("disableVAQueue", {
	redis: {
		host: process.env.REDIS_HOST || "127.0.0.1",
		port: process.env.REDIS_PORT || 6379,
	},
});

export default disableVAQueue;
