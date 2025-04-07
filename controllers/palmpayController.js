import axios from "axios";
import md5 from "md5";
import crypto from "node:crypto";

import User from "../models/User.js";
import { rsaVerify, sign, sortParams } from "../palmpay.js";
import { generateNonceStr } from "../services/palmpay.js";
import ApiError from "../utils/error.js";
import { generateRandomReference } from "../utils/helpers.js";
import Transaction from "../models/Transaction.js";
import { logUserActivity } from "../utils/userActivity.js";

export const createVirtualAccount = async (req, res, next) => {
	try {
		const { amount } = req.body;

		// Validate amount
		if (!amount || amount <= 0) {
			throw new ApiError(
				400,
				false,
				"Amount must be a positive number",
				`Amount: ${amount}`,
			);
		}

		const user = await User.findById(req.user.id);
		if (!user) {
			throw new ApiError(404, false, "User not found");
		}

		const accountReference = generateRandomReference("VIR_ACC", user.firstName);

		const nonceStr = generateNonceStr();

		const payload = {
			virtualAccountName: `${user.firstName} ${user.lastName}`,
			identityType: "company",
			licenseNumber: process.env.BOLDDATA_LICENSE_NUMBER,
			email: user.email,
			customerName: `${user.firstName} ${user.lastName}`,
			accountReference,
			version: "V2.0",
			requestTime: Date.now(),
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
			`${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/create`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
					CountryCode: "NG",
					"Content-Type": "application/json;charset=UTF-8",
					Signature: generatedSignature,
				},
			},
		);

		if (response.status !== 200) {
			throw new ApiError(
				400,
				false,
				"Failed to create virtual account",
				response.data,
			);
		}

		const { data } = response.data;

		const transaction = await Transaction.create({
			user: user._id,
			reference: accountReference,
			type: "credit",
			serviceType: "deposit",
			amount: amount,
			status: "pending",
			metadata: {
				virtualAccountName: data.virtualAccountName,
				accountNumber: data.virtualAccountNo,
				status: data.status,
			},
		});

		user.transactions.push(transaction._id);
		await user.save();

		await logUserActivity(user._id, "others", {
			details: "Virtual Account Creation",
		});

		return res.status(200).json({
			success: true,
			message: "Virtual Account created successfully",
			data: {
				virtualAccountName: data.virtualAccountName,
				virtualAccountNo: data.virtualAccountNo,
				status: data.status,
				reference: data.accountReference,
			},
		});
	} catch (error) {
		console.error(
			"Failed to create virtual account",
			error?.response || error?.message || error,
		);

		next(error);
	}
};

export const updateVirtualAccountStatus = async (req, res, next) => {
	try {
		const { virtualAccountNo } = req.body;

		const user = await User.findById(req.user.id);
		if (!user) {
			throw new ApiError(404, false, "User not found");
		}

		const nonceStr = generateNonceStr();

		const payload = {
			requestTime: Date.now(),
			version: "V2.0",
			virtualAccountNo,
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
					CountryCode: "NG",
					"Content-Type": "application/json;charset=UTF-8",
					Signature: generatedSignature,
				},
			},
		);

		if (response.status !== 200) {
			throw new ApiError(
				400,
				false,
				"Failed to create update account status",
				response.data,
			);
		}

		const { data } = response;
		console.log(data);

		return res.status(200).json({
			success: true,
			message: "Account status updated successfully",
			data,
		});
	} catch (error) {
		console.error(
			"Failed to update virtual account status",
			error?.response || error?.message || error,
		);
		next(error);
	}
};

export const deleteVirtualAccount = async (req, res, next) => {
	try {
		const { virtualAccountNo } = req.body;

		const nonceStr = generateNonceStr();

		const payload = {
			requestTime: Date.now(),
			nonceStr,
			version: "V2.0",
			virtualAccountNo,
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
			`${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/delete`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
					"Content-Type": "application/json;charset=UTF-8",
					CountryCode: "NG",
					Signature: generatedSignature,
				},
			},
		);

		if (response.status !== 200) {
			throw new ApiError(
				400,
				false,
				"Failed to delete virtual account",
				response.data,
			);
		}

		return res.status(200).json({
			success: true,
			message: "Deleted virtual account successfully",
		});
	} catch (error) {
		console.error(
			"Failed to delete virtual account",
			error?.response || error?.message || error,
		);

		next(error);
	}
};

export const queryVirtualAccount = async (req, res, next) => {
	try {
		const { virtualAccountNo } = req.body;

		const user = await User.findById(req.user.id);
		if (!user) {
			throw new ApiError(404, false, "User not found");
		}

		const nonceStr = generateNonceStr();

		const payload = {
			requestTime: Date.now(),
			nonceStr,
			version: "V2.0",
			virtualAccountNo,
		};

		const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

		const response = await axios.post(
			`${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/queryOne`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
					"Content-Type": "application/json;charset=UTF-8",
					CountryCode: "NG",
					Signature: generatedSignature,
				},
			},
		);

		if (response.status !== 200) {
			throw new ApiError(
				400,
				false,
				"Failed to query virtual account",
				response.data,
			);
		}

		const { data } = response.data;

		return res.status(200).json({
			success: true,
			message: "Virtual account fetched successfully",
			data: {
				accountName: data.virtualAccountName,
				accountNumber: data.virtualAccountNo,
				status: data.status,
				email: data.email,
				customerName: data.customerName,
			},
		});
	} catch (error) {
		console.error(
			"Failed to fetch virtual account details",
			error?.response || error?.message || error,
		);

		next(error);
	}
};

export const handlePalmpayWebhook = async (req, res, next) => {
	console.log("request", request);
	console.log("this is the request headers", req.headers);
	try {
		const forwarded = req.headers["x-forwarded-for"];
		const requestIp = forwarded ? forwarded.split(",")[0].trim() : req.ip;

		console.log(requestIp, process.env.PALMPAY_IP);

		if (requestIp !== process.env.PALMPAY_IP) {
			throw new ApiError(403, false, "Unauthorized request origin");
		}

		if (req.body.orderStatus !== 1) {
			return res.status(200).json({
				success: true,
				message: "Webhook received but not processed (non-successful payment)",
			});
		}

		const existing = await Transaction.findOne({
			"metadata.orderNo": req.body.orderNo,
			status: "success",
		});

		if (existing) {
			return res.status(200).json({ success: true });
		}

		await handlePaymentSuccess(req.body).catch(console.error);

		console.log("done with processing payment");

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error("Palmpay webhook error:", error);
		next(error);
	}
};

async function handlePaymentSuccess(paymentData) {
	const transaction = await Transaction.findOneAndUpdate(
		{
			reference: paymentData.accountReference,
			status: { $ne: "success" },
		},
		{
			$set: {
				amount: paymentData.orderAmount / 100,
				status: "success",
				metadata: {
					orderNo: paymentData.orderNo,
					payerAccountNo: paymentData.payerAccountNo,
					payerBankName: paymentData.payerBankName,
					payerAccountName: paymentData.payerAccountName,
					virtualAccountNo: paymentData.virtualAccountNo,
					currency: paymentData.currency,
					paymentReference: paymentData.reference,
					appId: paymentData.appId,
					processedAt: new Date(),
				},
			},
		},
		{ new: true },
	);

	if (!transaction) {
		console.log(`Transaction already processed: ${paymentData.orderNo}`);
		return;
	}

	await User.findByIdAndUpdate(transaction.user, {
		$inc: { accountBalance: paymentData.orderAmount / 100 },
	});

	await logUserActivity(transaction.user, "deposit", {
		amount: paymentData.orderAmount / 100,
		transactionId: paymentData.orderNo,
		paymentMethod: `${paymentData.payerBankName} (${paymentData.payerAccountNo})`,
	});

	console.log(
		`Processed successful payment for transaction ${paymentData.orderNo}`,
	);
}

async function handlePaymentFailed(event) {
	const { transactionId, merchantReference, reason } = event.data;

	const transaction = await Transaction.findOne({
		reference: merchantReference,
	});

	if (!transaction) {
		throw new ApiError(404, false, "Transaction not found");
	}

	transaction.status = "failed";
	transaction.metadata = {
		...transaction.metadata,
		failureReason: reason,
		bolddDataTransactionId: transactionId,
	};

	await transaction.save();

	console.log(`Marked transaction ${transactionId} as failed: ${reason}`);
}

async function handleChargeback(event) {
	const { transactionId, originalTransactionId, amount, reason } = event.data;

	const transaction = await Transaction.findONe({
		"metadata.boldDataTransactionId": originalTransactionId,
	});

	if (!transaction) {
		throw new ApiError(404, false, "Original transaction not found");
	}

	const chargeback = new Transaction({
		type: "debit",
		serviceType: "chargeback",
		amount,
		status: "completed",
		reference: `CB_${transactionId}`,
		metadata: {
			originalTransaction: originalTransactionId,
			reason,
			processedAt: new Date(),
		},
		user: transaction.user,
	});

	await chargeback.save();

	const user = await User.findById(transaction.user);
	if (user) {
		user.balance -= amount;
		await user.save();
		await logUserActivity(user._id, "chargeback", {
			amount,
			originalTransactionId,
			newBalance: user.balance,
		});
	}

	console.log(`Processed chareback for transaction ${originalTransactionId}`);
}
