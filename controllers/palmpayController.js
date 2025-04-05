import axios from 'axios';
import md5 from 'md5';

import User from '../models/User.js';
import { rsaVerify, sign, sortParams } from '../palmpay.js';
import { generateNonceStr, generateSignature } from '../services/palmpay.js';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';
import Transaction from '../models/Transaction.js';
import { logUserActivity } from '../utils/userActivity.js';

export const createVirtualAccount = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ApiError(
        400,
        false,
        'Amount must be a positive number',
        `Amount: ${amount}`
      );
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    const accountReference = generateRandomReference('VIR_ACC', user.firstName);

    const nonceStr = generateNonceStr();

    const payload = {
      virtualAccountName: `${user.firstName} ${user.lastName}`,
      identityType: 'company',
      licenseNumber: 'RC12345',
      email: user.email,
      customerName: `${user.firstName} ${user.lastName}`,
      accountReference,
      version: 'V2.0',
      requestTime: Date.now(),
      nonceStr,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const isVerified = rsaVerify(
      md5(sortParams(payload)).toUpperCase(),
      generatedSignature,
      process.env.PALMPAY_PUBLIC_KEY,
      'SHA1withRSA'
    );
    console.log('Signature Verified:', isVerified);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/create`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          CountryCode: 'NG',
          'Content-Type': 'application/json;charset=UTF-8',
          Signature: generatedSignature,
        },
      }
    );

    if (response.status !== 200) {
      throw new ApiError(
        400,
        false,
        'Failed to create virtual account',
        response.data
      );
    }

    const { data } = response.data;

    const transaction = await Transaction.create({
      reference: accountReference,
      type: 'credit',
      serviceType: 'deposit',
      amount: amount,
      status: 'pending',
      metadata: {
        virtualAccountName: data.virtualAccountName,
        accountNumber: data.virtualAccountNo,
        status: data.status,
      },
    });

    user.transactions.push(transaction._id);
    await user.save();

    await logUserActivity(user._id, 'others', {
      details: 'Virtual Account Creation',
    });

    return res.status(200).json({
      success: true,
      message: 'Virtual Account created successfully',
      data: {
        virtualAccountName: data.virtualAccountName,
        virtualAccountNo: data.virtualAccountNo,
        status: data.status,
        reference: data.accountReference,
      },
    });
  } catch (error) {
    console.error(
      'Failed to create virtual account',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const updateVirtualAccountStatus = async (req, res, next) => {
  try {
    const { virtualAccountNo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    const nonceStr = generateNonceStr();

    const payload = {
      requestTime: Date.now(),
      version: 'V2.0',
      virtualAccountNo,
      status: 'Disabled',
      nonceStr,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const isVerified = rsaVerify(
      md5(sortParams(payload)).toUpperCase(),
      generatedSignature,
      process.env.PALMPAY_PUBLIC_KEY,
      'SHA1withRSA'
    );

    console.log('Signature Verified:', isVerified);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/update`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json;charset=UTF-8',
          Signature: generatedSignature,
        },
      }
    );

    const { data } = response;
    console.log(data);

    return res.status(200).json({
      success: true,
      message: 'Account status updated successfully',
      data,
    });
  } catch (error) {
    console.error(
      'Failed to update virtual account status',
      error?.response || error?.message || error
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
      version: 'V2.0',
      virtualAccountNo,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const isVerified = rsaVerify(
      md5(sortParams(payload)).toUpperCase(),
      generatedSignature,
      process.env.PALMPAY_PUBLIC_KEY,
      'SHA1withRSA'
    );
    console.log('Signature Verified:', isVerified);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/delete`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json;charset=UTF-8',
          CountryCode: 'NG',
          Signature: generatedSignature,
        },
      }
    );

    if (response.status !== 200) {
      throw new ApiError(
        400,
        false,
        'Failed to delete virtual account',
        response.data
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Deleted virtual account successfully',
    });
  } catch (error) {
    console.error(
      'Failed to delete virtual account',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const queryVirtualAccount = async (req, res, next) => {
  try {
    const { virtualAccountNo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    const nonceStr = generateNonceStr();

    const payload = {
      requestTime: Date.now(),
      nonceStr,
      version: 'V2.0',
      virtualAccountNo,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/queryOne`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json;charset=UTF-8',
          CountryCode: 'NG',
          Signature: generatedSignature,
        },
      }
    );

    if (response.status !== 200) {
      throw new ApiError(
        400,
        false,
        'Failed to query virtual account',
        response.data
      );
    }

    const { data } = response.data;

    return res.status(200).json({
      success: true,
      message: 'Virtual account fetched successfully',
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
      'Failed to fetch virtual account details',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const handlePalmPayWebhook = async (req, res, next) => {
  try {
    // 1. Verify the incoming webhook signature
    const signature = req.headers.signature;
    if (!signature) {
      throw new ApiError(401, false, 'Missing signature header');
    }

    // 2. Sort and verify the payload
    const sortedParams = sortParams(req.body);
    const verifyResult = rsaVerify(
      md5(sortedParams).toUpperCase(),
      signature,
      process.env.PALMPAY_PUBLIC_KEY,
      'SHA1withRSA'
    );

    if (!verifyResult) {
      throw new ApiError(401, false, 'Invalid webhook signature');
    }

    const webhookData = req.body;
    console.log(
      'Received PalmPay webhook:',
      JSON.stringify(webhookData, null, 2)
    );

    // 3. Handle different webhook event types
    switch (webhookData.eventType) {
      case 'VIRTUAL_ACCOUNT_PAYMENT':
        await handleVirtualAccountPayment(webhookData);
        break;

      case 'TRANSFER_SUCCESS':
        await handleTransferSuccess(webhookData);
        break;

      case 'TRANSFER_FAILED':
        await handleTransferFailed(webhookData);
        break;

      case 'DISPUTE':
        await handleDispute(webhookData);
        break;

      default:
        console.warn('Unhandled PalmPay webhook event:', webhookData.eventType);
        return res.status(200).json({
          success: true,
          message: 'Webhook received but not processed',
        });
    }

    res
      .status(200)
      .json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error(
      'Failed to process PalmPay webhook:',
      error?.response || error?.message || error
    );
    next(error);
  }
};

// Handle virtual account payment notifications
async function handleVirtualAccountPayment(webhookData) {
  const {
    virtualAccountNo,
    amount,
    transactionReference,
    paymentReference,
    paymentDate,
    payerName,
    payerPhone,
    remark,
  } = webhookData;

  // Find transaction by virtual account number
  const transaction = await Transaction.findOne({
    'metadata.accountNumber': virtualAccountNo,
    status: 'pending',
  });

  if (!transaction) {
    console.warn(
      `Transaction not found for virtual account: ${virtualAccountNo}`
    );
    return;
  }

  // Update transaction status
  transaction.status = 'completed';
  transaction.paymentReference = paymentReference;
  transaction.metadata.payerName = payerName;
  transaction.metadata.payerPhone = payerPhone;
  transaction.metadata.paymentDate = paymentDate;
  transaction.metadata.remark = remark;
  await transaction.save();

  // Find user and update balance
  const user = await User.findById(transaction.user);
  if (user) {
    user.balance += amount;
    await user.save();

    // Log user activity
    await logUserActivity(user._id, 'deposit', {
      amount,
      reference: transactionReference,
      newBalance: user.balance,
    });
  }

  console.log(
    `Successfully processed payment for virtual account: ${virtualAccountNo}`
  );
}

// Handle successful transfers
async function handleTransferSuccess(webhookData) {
  const {
    transactionReference,
    amount,
    fee,
    recipientAccount,
    recipientName,
    recipientBank,
    status,
    timestamp,
  } = webhookData;

  // Find transaction by reference
  const transaction = await Transaction.findOne({
    reference: transactionReference,
    type: 'debit',
    serviceType: 'transfer',
  });

  if (!transaction) {
    console.warn(`Transfer transaction not found: ${transactionReference}`);
    return;
  }

  // Update transaction status
  transaction.status = 'completed';
  transaction.metadata.fee = fee;
  transaction.metadata.recipientDetails = {
    account: recipientAccount,
    name: recipientName,
    bank: recipientBank,
  };
  await transaction.save();

  const user = await User.findById(transaction.user);
  if (user) {
    await logUserActivity(user._id, 'transfer', {
      amount,
      fee,
      recipient: recipientName,
      reference: transactionReference,
    });
  }

  console.log(`Successfully processed transfer: ${transactionReference}`);
}

// Handle failed transfers
async function handleTransferFailed(webhookData) {
  const {
    transactionReference,
    amount,
    recipientAccount,
    recipientName,
    reason,
    timestamp,
  } = webhookData;

  const transaction = await Transaction.findOne({
    reference: transactionReference,
    type: 'debit',
    serviceType: 'transfer',
  });

  if (!transaction) {
    console.warn(`Transfer transaction not found: ${transactionReference}`);
    return;
  }

  transaction.status = 'failed';
  transaction.metadata.failureReason = reason;
  transaction.metadata.recipientAccount = recipientAccount;
  transaction.metadata.recipientName = recipientName;
  await transaction.save();

  // Find user and refund balance if needed
  const user = await User.findById(transaction.user);
  if (user) {
    user.balance += amount;
    await user.save();

    await logUserActivity(user._id, 'transfer_failed', {
      amount,
      reference: transactionReference,
      reason,
      newBalance: user.balance,
    });
  }

  console.log(`Marked transfer as failed: ${transactionReference}`);
}

// Handle dispute notifications
async function handleDispute(webhookData) {
  const {
    transactionReference,
    disputeReference,
    amount,
    reason,
    status,
    timestamp,
  } = webhookData;

  const transaction = await Transaction.findOne({
    reference: transactionReference,
  });

  if (!transaction) {
    console.warn(`Transaction not found for dispute: ${transactionReference}`);
    return;
  }

  // Create or update dispute record
  transaction.dispute = {
    reference: disputeReference,
    reason,
    status,
    openedAt: timestamp,
  };
  await transaction.save();

  const user = await User.findById(transaction.user);
  if (user) {
    await logUserActivity(user._id, 'dispute', {
      amount,
      transactionReference,
      disputeReference,
      reason,
      status,
    });
  }

  console.log(`Processed dispute for transaction: ${transactionReference}`);
}
