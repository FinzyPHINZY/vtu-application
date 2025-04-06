const crypto = require('node:crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ApiError = require('../utils/error');
const { logUserActivity } = require('../utils/userActivity');
const config = require('../config');

// Configuration
const BOLD_DATA_IP = '47.254.157.75'; // Replace with actual BoldData IP
const SIGNATURE_SECRET = config.boldData.webhookSecret;

async function handleBoldDataWebhook(req, res, next) {
  try {
    // 1. Verify the request origin
    const forwarded = req.headers.forwarded;
    const match = forwarded ? forwarded.match(/for=([\d.]+)/) : null;
    const requestIp = match ? match[1] : null;

    if (requestIp !== BOLD_DATA_IP) {
      console.error('Invalid IP address:', requestIp);
      throw new ApiError(403, 'Unauthorized request origin');
    }

    // 2. Verify the webhook signature
    const signature = req.headers['x-bold-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', SIGNATURE_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new ApiError(401, 'Invalid webhook signature');
    }

    const event = req.body;

    // 3. Process different event types
    switch (event.type) {
      case 'payment.success':
        await handlePaymentSuccess(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'chargeback':
        await handleChargeback(event);
        break;
      default:
        console.warn('Unhandled BoldData event type:', event.type);
    }

    // 4. Send success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('BoldData webhook error:', error);
    next(error);
  }
}

async function handlePaymentSuccess(event) {
  const {
    transactionId,
    merchantReference,
    amount,
    currency,
    customerEmail,
    customerName,
    timestamp,
  } = event.data;

  // Find the transaction
  const transaction = await Transaction.findOne({
    reference: merchantReference,
  });
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Update transaction status
  transaction.status = 'completed';
  transaction.metadata = {
    ...transaction.metadata,
    boldDataTransactionId: transactionId,
    customerEmail,
    customerName,
    completedAt: new Date(timestamp),
  };
  await transaction.save();

  // Find and update user balance
  const user = await User.findById(transaction.user);
  if (user) {
    user.balance += amount;
    await user.save();

    // Log activity
    await logUserActivity(user._id, 'payment_received', {
      amount,
      currency,
      transactionId,
      newBalance: user.balance,
    });
  }

  console.log(`Processed successful payment for transaction ${transactionId}`);
}

async function handlePaymentFailed(event) {
  const { transactionId, merchantReference, reason } = event.data;

  const transaction = await Transaction.findOne({
    reference: merchantReference,
  });
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  transaction.status = 'failed';
  transaction.metadata = {
    ...transaction.metadata,
    failureReason: reason,
    boldDataTransactionId: transactionId,
  };
  await transaction.save();

  console.log(`Marked transaction ${transactionId} as failed: ${reason}`);
}

async function handleChargeback(event) {
  const { transactionId, originalTransactionId, amount, reason } = event.data;

  // Find the original transaction
  const transaction = await Transaction.findOne({
    'metadata.boldDataTransactionId': originalTransactionId,
  });
  if (!transaction) {
    throw new ApiError(404, 'Original transaction not found');
  }

  // Create chargeback record
  const chargeback = new Transaction({
    type: 'debit',
    serviceType: 'chargeback',
    amount: amount,
    status: 'completed',
    reference: `CB-${transactionId}`,
    metadata: {
      originalTransaction: originalTransactionId,
      reason: reason,
      processedAt: new Date(),
    },
    user: transaction.user,
  });
  await chargeback.save();

  // Update user balance if needed
  const user = await User.findById(transaction.user);
  if (user) {
    user.balance -= amount;
    await user.save();
    await logUserActivity(user._id, 'chargeback', {
      amount,
      originalTransactionId,
      newBalance: user.balance,
    });
  }

  console.log(`Processed chargeback for transaction ${originalTransactionId}`);
}

module.exports = {
  handleBoldDataWebhook,
};
