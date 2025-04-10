import disableVAQueue, { disableVAEvent } from "../queues/disableVAQueue.js";
import { disableVAWorker } from "./disableVAWorker.js";

export const startQueues = async () => {
	await disableVAQueue.waitUntilReady();
	await disableVAWorker.waitUntilReady();
	await disableVAEvent.waitUntilReady();
};

export const stopQueues = async () => {
	await disableVAWorker.close();
	await disableVAQueue.close();
	console.info("Queues and workers closed!");
};
