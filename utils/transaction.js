import User from '../models/User.js';
import sendEmail from '../services/emailService.js';

// Utility function to validate phone number format
export const isValidPhoneNumber = (phoneNumber) => {
  return /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
};

// Utility function to validate account balance
export const validateBalance = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(404, 'User not found');
  }

  if (user.accountBalance < amount) {
    throw new Error(400, 'Insufficient account balance');
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
      user.transactions.push({
        ...transactionDetails,
        amount,
        type: 'debit',
        status: 'pending',
        createdAt: new Date(),
      });

      await user.save({ session });
    });

    await session.endSession();
    return user.transactions[user.transactions.length - 1];
  } catch (error) {
    console.error('Transaction processing failed:', error);
    throw new Error(500, 'Failed to process transaction');
  }
};

// Utility function to send transaction receipt
export const sendTransactionReceipt = async (user, transaction) => {
  try {
    const receiptText = `
      Transaction Receipt
      Type: ${transaction.serviceType}
      Amount: ${transaction.amount}
      Status: ${transaction.status}
      Reference: ${transaction.reference}
      Date: ${transaction.createdAt}
      
      Thank you for using our service!
    `;

    await sendEmail(user.email, 'Transaction Receipt', receiptText);
  } catch (error) {
    console.error('Failed to send receipt:', error);
    // Not throwing this error as this is not critical
  }
};
