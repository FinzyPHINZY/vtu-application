import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import sendEmail from '../services/emailService.js';
import { generateTransactionReceipt } from './email.js';
import ApiError from './error.js';

// Utility function to validate phone number format
export const isValidPhoneNumber = (phoneNumber) => {
  return /^0\d{10}$/.test(phoneNumber);
};

export const isValidAccountNumber = (accountNumber) => {
  return /^\d{10}$/.test(accountNumber);
};

// Utility function to validate account balance
export const validateBalance = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.accountBalance < amount) {
    throw new ApiError(400, 'Insufficient account balance');
  }

  return user;
};

// Utility function to update user balance and save transaction
export const processTransaction = async (user, amount, transactionDetails) => {
  try {
    // Start a session for transaction atomicity
    const session = await User.startSession();
    await session.withTransaction(async () => {
      // Deduct amount from user balance
      user.accountBalance -= amount;

      // Add transaction to history
      // Create a new transaction document
      const transaction = await Transaction.create(
        [
          {
            ...transactionDetails,
            amount,
            type: 'debit',
            status: 'pending',
            user: user._id, // Link transaction to user
          },
        ],
        { session }
      );

      // Push only the transaction ID into user's transactions array
      user.transactions.push(transaction[0]._id);

      // Save user document
      await user.save({ session });
    });

    await session.endSession();
    return user.transactions[user.transactions.length - 1];
  } catch (error) {
    console.error('Transaction processing failed:', error);
    throw new ApiError(500, 'Failed to process transaction');
  }
};

// Utility function to send transaction receipt
export const sendTransactionReceipt = async (user, transaction) => {
  try {
    // const transactionDoc = await Transaction.findById(transaction);
    const receiptHtml = generateTransactionReceipt(user, transaction);

    // console.log(transactionDoc);

    await sendEmail(user.email, 'Transaction Receipt', receiptHtml);
  } catch (error) {
    console.error('Failed to send receipt:', error);
    // Not throwing this error as this is not critical
  }
};
