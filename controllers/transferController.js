import mongoose from "mongoose";

import Transaction from "../models/Transaction.js";
import ApiError from "../utils/error.js";
import { generateRandomReference } from "../utils/helpers.js";
import User from "../models/User.js";
import { logUserActivity } from "../utils/userActivity.js";

export const createTransfer = async (req, res, next) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { recipientIdentifier, amount, note } = req.body;
		const senderId = req.user.id;

		// Validate input
		if (!recipientIdentifier || !amount || amount <= 0) {
			throw new ApiError(400, false, "Invalid recipient or amount");
		}

		if (recipientIdentifier === senderId.toString()) {
			throw new ApiError(400, false, "Cannot transfer to yourself");
		}

		const sender = await User.findByIdAndUpdate(
			senderId,
			{ $inc: { accountBalance: -amount } },
			{ new: true, session },
		).select("accountBalance firstName");

		// const sender = await User.findById(senderId).session(session);
		if (!sender) throw new ApiError(404, false, "Sender not found");

		const availableBalance = sender.accountBalance;
		if (availableBalance < 0) {
			throw new ApiError(400, false, "Insufficient balance");
		}

		const recipient = await User.findOneAndUpdate(
			{
				$or: [
					{ _id: recipientIdentifier },
					{ email: recipientIdentifier },
					{ phone: recipientIdentifier },
				],
				isVerified: true,
			},
			{ $inc: { accountBalance: amount } },
			{ new: true, session },
		).select("_id name");

		// const recipient = await User.findOne({
		// 	$or: [
		// 		{ _id: recipientIdentifier },
		// 		{ email: recipientIdentifier },
		// 		{ phone: recipientIdentifier },
		// 	],
		// }).session(session);

		if (!recipient) throw new ApiError(404, false, "Recipient not found");

		const reference = generateRandomReference("TRF", sender.firstName);
		const timestamp = new Date();

		// Create DEBIT transaction (sender)
		const debitTx = new Transaction({
			reference: `${reference}-DEBIT`,
			serviceType: "bank_transfer",
			user: senderId,
			relatedUser: recipient._id,
			amount,
			type: "debit",
			status: "success",
			metadata: {
				note: note || "",
				currentBalance: sender.accountBalance,
				counterparty: {
					id: recipient._id,
					name: recipient.name,
				},
			},
			timestamp,
		});

		const creditTx = new Transaction({
			reference: `${reference}-CREDIT`,
			serviceType: "bank_transfer",
			user: recipient._id,
			relatedUser: senderId,
			amount,
			type: "credit",
			status: "success",
			metadata: {
				note: note || "",
				currentBalance: recipient.accountBalance + amount,
				counterparty: {
					id: senderId,
					name: sender.firstName,
				},
			},
			timestamp,
		});
		await Promise.all([debitTx.save({ session }), creditTx.save({ session })]);

		await session.commitTransaction();

		// Log activities
		await Promise.all([
			logUserActivity(senderId, "transfer-out", {
				amount,
				recipient: recipient._id,
				newBalance: sender.accountBalance,
			}),
			logUserActivity(recipient._id, "transfer-in", {
				amount,
				sender: senderId,
				newBalance: recipient.accountBalance,
			}),
		]);

		await session.commitTransaction();

		return res.status(201).json({
			success: true,
			message: "Transfer completed successfully",
			data: {
				transactionId: debitTx._id,
				newBalance: sender.accountBalance,
				recipient: {
					id: recipient._id,
					name: recipient.name,
				},
				// Include both transaction IDs for reference
				transactions: {
					debit: debitTx._id,
					credit: creditTx._id,
				},
			},
		});
	} catch (error) {
		await session.abortTransaction();
		next(error);
	} finally {
		session.endSession();
	}
};

export const getTransferHistory = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, type = "debit" } = req.query;
		const userId = req.user.id;

		const query = {
			$or: [{ user: userId }, { recipient: userId }],
			serviceType: "bank_transfer",
		};

		if (type === "debit") query.user = userId;
		if (type === "credit") query.recipient = userId;

		const transfers = await Transaction.find(query)
			.populate(
				type === "debit" ? "recipient" : "user",
				"firstName lastName email phoneNumber",
			)
			.sort("-createdAt")
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const count = await Transaction.countDocuments(query);

		res.status(200).json({
			success: true,
			data: transfers,
			pagination: {
				total: count,
				totalPages: Math.ceil(count / limit),
				currentPage: page,
				itemsPerPage: limit,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const verifyRecipient = async (req, res, next) => {
	try {
		const { recipientIdentifier } = req.body;
		const senderId = req.user.id;

		if (!recipientIdentifier) {
			throw new ApiError(400, false, "Recipient identifier is required");
		}

		if (recipientIdentifier === senderId.toString()) {
			throw new ApiError(400, false, "Cannot transfer to yourself");
		}

		const isValidObjectId =
			mongoose.Types.ObjectId.isValid(recipientIdentifier);

		const recipient = await User.findOne({
			$or: [
				// { _id: recipientIdentifier },
				...(isValidObjectId ? [{ _id: recipientIdentifier }] : []),
				{ email: recipientIdentifier },
				{ phoneNumber: recipientIdentifier },
			],
		}).select("_id firstName lastName email phoneNumber lastActive isVerified");

		if (!recipient) {
			throw new ApiError(404, false, "Recipient not found");
		}

		if (!recipient.isVerified) {
			throw new ApiError(400, false, "Recipient account is not verified");
		}

		console.log(recipient.email);
		// Only show partial email/phone for privacy
		const maskedEmail = recipient.email.replace(/(.{2})(.*)(@.*)/, "$1****$3");
		const maskedPhone = recipient.phoneNumber.replace(
			/(\d{3})\d+(\d{3})/,
			"$1****$2",
		);

		const responseData = {
			_id: recipient._id,
			firstName: recipient.firstName,
			lastName: recipient.lastName,
			lastActive: recipient.lastActive,
			identifierUsed: recipientIdentifier,
		};

		// Only include email/phone if they match the identifier
		if (recipient.email === recipientIdentifier) {
			// responseData.email = recipient.email;
			responseData.phoneNumber = maskedPhone;
		} else if (recipient.phoneNumber === recipientIdentifier) {
			// responseData.phoneNumber = recipient.phoneNumber;
			responseData.email = maskedEmail;
		} else {
			// If searched by ID, return both contact methods
			responseData.email = recipient.email;
			responseData.phoneNumber = recipient.phoneNumber;
		}

		res.status(200).json({
			success: true,
			message: "Recipient verified",
			data: responseData,
		});
	} catch (error) {
		console.error("Failed to verify recipient", error);
		next(error);
	}
};
