import axios from 'axios';
import User from '../models/User.js';
import { generateRandomReference } from '../utils/helpers.js';
import ApiError from '../utils/error.js';
import Transaction from '../models/Transaction.js';
import { logUserActivity } from '../utils/userActivity.js';
import mongoose from 'mongoose';

export const createSubAccount = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      phoneNumber,
      emailAddress,
      identityType,
      identityNumber,
      identityId,
      otp,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found', user);
    }

    if (user.accountNumber) {
      throw new ApiError(409, false, 'User already has a sub-account');
    }

    const externalReference = generateRandomReference('ACC', user.firstName);

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber,
      emailAddress,
      externalReference,
      identityType,
      identityNumber,
      identityId,
      otp,
      callbackUrl: process.env.WEBHOOK_CALLBACK_URL,
      autoSweep: true,
      autoSweepDetails: {
        schedule: 'Instant',
        accountNumber: process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER,
      },
    };

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/accounts/v2/subaccount`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    console.log('response no bad sha', response.data);

    const { data, statusCode, message } = response.data;

    if (statusCode === 400) {
      throw new ApiError(statusCode, false, message);
    }

    user.accountBalance = data.accountBalance;
    user.accountNumber = data.accountNumber;
    user.accountDetails = {
      bankName: data.bankName,
      accountName: data.accountName,
      accountType: data.accountType,
      accountBalance: data.accountBalance,
      accountId: data._id,
      status: user.status,
      accountNumber: data.accountNumber,
    };

    await user.save();

    console.log('updated user successfully');

    await logUserActivity(user._id, 'others', {
      details: 'Sub-Account creation',
    });

    console.log(`Sub-account created successfully for user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Sub-account created successfully',
      data,
    });
  } catch (error) {
    console.error(error);

    next(error);
  }
};

export const handleSafeHavenWebhook = async (req, res, next) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType || !data) {
      throw new ApiError(400, 'Invalid webhook payload');
    }

    switch (eventType) {
      case 'account.credit': {
        // Process deposit to user's permanent account
        await handleDeposit(data);
        break;
      }

      case 'account.debit':
      case 'transfer.success':
      case 'transfer.failed':
      default: {
        // Log unhandled events but don't process them
        console.log(`Received unhandled SafeHaven event: ${eventType}`);
        return res.status(200).json({
          success: true,
          message: 'Webhook received but not processed (unhandled event type)',
        });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: 'webhook received successfullly' });
  } catch (error) {
    console.error('Failed to process Safe Haven Webhook', error);
    next(error);
  }
};

// async function handleDeposit(depositData) {
//   const user = await User.findOne({
//     accountNumber: depositData.creditAccountNumber,
//   });

//   if (!user) {
//     console.error(
//       `User not found for account: ${depositData.creditAccountNumber}`
//     );
//     throw new ApiError(404, false, 'User account not found');
//   }

//   const existingTransaction = await Transaction.findOne({
//     reference: depositData._id,
//     status: 'success',
//   });

//   if (existingTransaction) {
//     console.log(`Transaction already processed: ${depositData._id}`);
//     return;
//   }

//   const transaction = await Transaction.create({
//     reference: depositData._id,
//     serviceType: 'deposit',
//     type: 'credit',
//     amount: depositData.amount,
//     status: 'success',
//     user: user._id,
//     metadata: {
//       provider: 'SafeHaven',
//       providerChannel: depositData.providerChannel,
//       providerReference: depositData._id,
//       sessionId: depositData.sessionId,
//       debitAccountName: depositData.debitAccountName,
//       debitAccountNumber: depositData.debitAccountNumber,
//       destinationInstitutionCode: depositData.destinationInstitutionCode,
//       narration: depositData.narration,
//       processedAt: new Date(),
//     },
//     completedAt: new Date(),
//   });

//   user.transactions.push(transaction._id);

//   await user.save();

//   await User.findByIdAndUpdate(user._id, {
//     $inc: { accountBalance: depositData.amount },
//   });

//   // Log user activity
//   await logUserActivity(user._id, 'deposit', {
//     amount: depositData.amount,
//     transactionId: depositData._id,
//     paymentMethod: `${depositData.debitAccountName} (${depositData.debitAccountNumber})`,
//     provider: 'SafeHaven',
//   });

//   console.log(
//     `Processed successful deposit for user ${user._id}, amount: ${depositData.amount}`
//   );
// }

async function handleDeposit(depositData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({
      accountNumber: depositData.creditAccountNumber,
    }).session(session);

    if (!user) {
      throw new ApiError(404, false, 'User account not found');
    }

    const existingTransaction = await Transaction.findOne({
      reference: depositData._id,
      status: 'success',
    }).session(session);

    if (existingTransaction) {
      await session.abortTransaction();
      return;
    }

    // Create transaction
    const transaction = await Transaction.create(
      [
        {
          reference: depositData._id,
          serviceType: 'deposit',
          type: 'credit',
          amount: depositData.amount,
          status: 'success',
          user: user._id,
          metadata: {
            provider: 'SafeHaven',
            providerChannel: depositData.providerChannel,
            providerReference: depositData._id,
            sessionId: depositData.sessionId,
            debitAccount: {
              name: depositData.debitAccountName,
              number: depositData.debitAccountNumber,
            },
            institution: depositData.destinationInstitutionCode,
            narration: depositData.narration,
            processedAt: new Date(),
          },
          completedAt: new Date(),
          processingTime:
            new Date(depositData.updatedAt) - new Date(depositData.createdAt),
        },
      ],
      { session }
    );

    // Single atomic update operation
    await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { accountBalance: depositData.amount },
        $push: { transactions: transaction[0]._id },
        $set: { lastDepositAt: new Date() }, // Optional: track last deposit
      },
      { session }
    );

    await session.commitTransaction();

    await logUserActivity(user._id, 'deposit', {
      amount: depositData.amount,
      transactionId: depositData._id,
      paymentMethod: `${depositData.debitAccountName} (${depositData.debitAccountNumber})`,
      provider: 'SafeHaven',
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export const createVirtualAccount = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

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
      throw new ApiError(404, false, 'User not found', user);
    }

    const externalReference = generateRandomReference(
      'VIR_ACC',
      user.firstName
    );

    const payload = {
      validFor: 900,
      externalReference,
      amount,
      amountControl: 'Fixed',
      settlementAccount: {
        accountNumber: process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER,
        bankCode: process.env.SAFE_HAVEN_VIRTUAL_ACCOUNT_BANK_CODE,
      },
      callbackUrl: process.env.WEBHOOK_CALLBACK_URL,
    };

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/virtual-accounts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    if (response.data.statusCode !== 200) {
      throw new ApiError(
        response.data.statuscode,
        false,
        'Failed to create virtual account',
        response.data
      );
    }

    const { data } = response.data;

    const transaction = await Transaction.create({
      reference: externalReference,
      type: 'credit',
      serviceType: 'deposit',
      amount: data.amount,
      virtualAccountId: data._id,
      status: 'pending',
      metadata: {
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        expiresAt: data.expiryDate,
      },
      user: user._id,
    });

    // Push the transaction _id to the user's transactions array
    user.transactions.push(transaction._id);
    await user.save();

    await logUserActivity(user._id, 'others', {
      details: 'Virtual Account creation',
    });

    return res.status(200).json({
      success: true,
      message: 'Virtual account created successfully',
      data,
    });
  } catch (error) {
    console.error(error.response?.data.message || error.message);

    next(error);
  }
};

export const getVirtualAccount = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/virtual-accounts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const { data } = response.data;

    return res
      .status(200)
      .json({ success: true, message: 'fetched account successfully', data });
  } catch (error) {
    console.error(error.response || error.message);

    next(error);
  }
};

export const getVirtualTransaction = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { virtualAccountId } = req.params;

    if (!virtualAccountId) {
      throw new ApiError(400, false, 'Missing virtualAccountId in request');
    }

    const user = await User.findOne({ _id: req.user.id }).populate(
      'transactions'
    );

    if (!user) {
      throw new ApiError(404, false, 'Virtual account transaction not found');
    }

    const transaction = user.transactions.find(
      (t) => t.virtualAccountId === virtualAccountId
    );

    if (!transaction) {
      throw new ApiError(404, false, 'Transaction not found');
    }

    if (['success', 'failed'].includes(transaction.status)) {
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed',
        data: {
          status: transaction.status,
          amount: transaction.amount,
          reference: transaction.reference,
        },
      });
    }

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/virtual-accounts/${virtualAccountId}/transaction`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    console.log(response.data);

    const { data } = response.data;

    if (!data) {
      throw new ApiError(400, false, response.data.message, response.data);
    }

    if (data.status === 'Completed' || data.status === 'Failed') {
      transaction.status = data.status === 'Completed' ? 'success' : 'failed';

      if (data.status === 'Completed') {
        user.accountBalance += data.amount;

        await logUserActivity(user._id, 'deposit', {
          amount: data.amount,
          currency: 'NGN',
        });
      }

      await transaction.save();
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Virtual transaction fetched successfully',
      data,
    });
  } catch (error) {
    console.error(error.response?.data.message || error.message);

    next(error);
  }
};

export const virtualAccountStatus = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { sessionId } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/virtual-accounts/status`,
      { sessionId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const { data } = response.data;

    return res.status(200).json({
      success: true,
      message: 'Virtual account status fetched successfully',
      data,
    });
  } catch (error) {
    console.error(error.response?.data.message || error.message);

    next(error);
  }
};

export const getAccountDetails = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/accounts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000,
      }
    );

    const { data } = response;

    console.log(`Account details retrieved successfully for account ID: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Account details retrieved successfully',
      data,
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getAccounts = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { page = 0, limit = 100, isSubAccount = true } = req.query;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/accounts`,
      {
        params: {
          page,
          limit,
          isSubAccount,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response;

    console.log('Accounts retrieved successfully', {
      page,
      limit,
      isSubAccount,
      count: data.data?.length || 0,
    });

    return res.status(200).json({
      success: true,
      message: 'Accounts retrieved successfully',
      data: data.data,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalCount: data.totalCount,
        totalPages: Math.ceil(data.totalCount / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};
