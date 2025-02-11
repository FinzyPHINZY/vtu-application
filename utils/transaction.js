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
    throw new ApiError(404, false, 'User not found');
  }

  if (user.accountBalance < amount) {
    throw new ApiError(400, false, 'Insufficient account balance');
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
    throw new ApiError(500, false, 'Failed to process transaction');
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

const updateAccountBalance = async ({
  userId,
  accountNumber,
  transferAmount,
  transactionReference,
}) => {
  // Start a session for transaction atomicity
  const session = await User.startSession();

  try {
    await session.withTransaction(async () => {
      // Validate transfer amount
      if (!transferAmount || transferAmount <= 0) {
        throw new ApiError(400, false, 'Invalid transfer amount');
      }

      // Find user by either userId or accountNumber
      const query = userId ? { _id: userId } : { accountNumber };
      const user = await User.findOne(query).session(session);

      if (!user) {
        throw new ApiError(404, false, 'User account not found');
      }

      // Check for duplicate transaction
      const existingTransaction = user.transactions.find(
        (t) => t.reference === transactionReference
      );
      if (existingTransaction) {
        throw new ApiError(409, false, 'Transaction already processed', {
          transactionReference,
          status: existingTransaction.status,
        });
      }

      // Store previous balance for transaction record
      const previousBalance = user.accountBalance;

      // Update balance using MongoDB's atomic operations
      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $inc: { accountBalance: transferAmount },
          $push: {
            transactions: {
              reference: transactionReference,
              type: 'credit',
              amount: transferAmount,
              previousBalance,
              newBalance: previousBalance + transferAmount,
              status: 'success',
              metadata: {
                transferType: 'incoming_transfer',
                timestamp: new Date(),
              },
            },
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        throw new ApiError(500, false, 'Failed to update account balance');
      }

      // Get the newly added transaction
      const transaction = updatedUser.transactions.find(
        (t) => t.reference === transactionReference
      );

      logger.info(
        `Account balance updated successfully for user: ${updatedUser._id}`,
        {
          transactionReference,
          previousBalance,
          newBalance: updatedUser.accountBalance,
        }
      );

      return {
        accountBalance: updatedUser.accountBalance,
        transactionStatus: 'success',
        transactionReference,
        transaction,
      };
    });
  } catch (error) {
    logger.error('Failed to update account balance:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      throw new ApiError(409, false, 'Duplicate transaction reference');
    }

    throw new ApiError(500, false, 'Failed to process transfer', {
      originalError: error.message,
    });
  } finally {
    await session.endSession();
  }
};
