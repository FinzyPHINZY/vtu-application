import axios from "axios";
import disableVAQueue from "../queues/disableVAQueue.js";
import { config } from "dotenv";
import { generateNonceStr } from "../services/palmpay.js";
import { rsaVerify, sign, sortParams } from "../palmpay.js";
import md5 from "md5";
import ApiError from "../utils/error.js";

config();

disableVAQueue.process(async (job) => {
	const { vaId, transactionId } = job.data;

	if (!vaId || !transactionId) {
		throw new Error("Invalid job data - missing vaId or transactionId");
	}

	console.log(
		`⏳ Disabling virtual account ${vaId} for transaction ${transactionId}`,
	);

	try {
		const nonceStr = generateNonceStr();

		const payload = {
			requestTime: Date.now(),
			version: "V2.0",
			virtualAccountNo: vaId,
			status: "Disabled",
			nonceStr,
		};

		const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

		const isVerified = rsaVerify(
			md5(sortParams(payload)).toUpperCase(),
			generatedSignature,
			process.env.PALMPAY_PUBLIC_KEY,
			"SHA1withRSA",
		);

		console.log("Signature Verified:", isVerified);

		const response = await axios.post(
			`${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/update`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
					"Content-Type": "application/json",
					CountryCode: "NG",
					Signature: generatedSignature,
				},
			},
		);

		if (response.status !== 200) {
			console.error(
				`❌ Error disabling VA ${vaId}:`,
				response.statusText || response.data,
			);
			throw new Error(
				`Failed to disable VA ${vaId} (status: ${response.status})`,
			);
		}

		console.log(`✅ VA ${vaId} disabled successfully`);

		return response.data;
	} catch (error) {
		console.error(`❌ Error disabling VA ${vaId}:`, error.message);
		throw error;
	}
});

disableVAQueue.on("failed", (job, err) => {
	console.error(`💥 Job failed for VA ${job.data.vaId}: ${err.message}`);
	// Notify admin, send to Slack, etc.
});

disableVAQueue.on("completed", (job, result) => {
	console.log(`Job completed for VA ${job.data.vaId}`);
	// Send metrics to monitoring system
});

disableVAQueue.on("progress", (job, progress) => {
	console.log(`Job progress: ${progress}%`);
});
