import axios from 'axios';
import md5 from 'md5';

import User from '../models/User.js';
import { rsaVerify, sign, sortParams } from '../palmpay.js';
import { generateNonceStr } from '../services/palmpay.js';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';
import Transaction from '../models/Transaction.js';
import { logUserActivity } from '../utils/userActivity.js';
import disableVAQueue from '../queues/disableVAQueue.js';

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

    // Check if user already has an account number and details
    if (user.accountNumber && user.accountDetails?.accountNumber) {
      // Find the most recent successful deposit transaction

      return res.status(200).json({
        success: true,
        message: 'User Account already exists',
        data: {
          virtualAccountName:
            user.accountDetails.accountName ||
            `${user.firstName} ${user.lastName}`,
          virtualAccountNo: user.accountDetails.accountNumber,
          status: user.accountDetails.status || 'active',
        },
      });
    }

    const nonceStr = generateNonceStr();

    const payload = {
      virtualAccountName: `${user.firstName} ${user.lastName}`,
      identityType: 'personal',
      licenseNumber: user.verificationMetadata.number,
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
      user: user._id,
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
        'Failed to  update account status',
        response.data
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Account status updated successfully',
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
          'Content-Type': 'application/json',
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

export const handlePalmpayWebhook = async (req, res, next) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const requestIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;

    // if (requestIp !== process.env.PALMPAY_IP) {
    // 	throw new ApiError(403, false, "Unauthorized request origin");
    // }

    if (req.body.orderStatus !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Webhook received but not processed (non-successful payment)',
      });
    }

    // const isVerified = rsaVerify(
    // 	md5(sortParams(req.body)).toUpperCase(),
    // 	req.body.sign,
    // 	process.env.PALMPAY_PUBLIC_KEY,
    // 	"SHA1withRSA",
    // );

    // console.log("Signature Verified:", isVerified);

    // if (!isVerified) {
    // 	throw new ApiError(403, false, "Invalid signature");
    // }

    if (req.body.orderStatus !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Webhook received but not processed',
      });
    }

    const existing = await Transaction.findOne({
      'metadata.orderNo': req.body.orderNo,
      status: 'success',
    });

    if (existing) {
      return res.status(200).json({ success: true });
    }

    await handlePaymentSuccess(req.body);

    console.log('done with processing payment');

    const user = await User.findOne({
      'accountDetails.accountNumber': req.body.virtualAccountNo,
    });

    if (!user.accountNumber) {
      await disableVAQueue.add('palmpay-job', {
        vaId: req.body.virtualAccountNo,
        transactionId: req.body.reference,
      });

      console.log('added to queue already');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Palmpay webhook error:', error);
    next(error);
  }
};

async function handlePaymentSuccess(paymentData) {
  let transaction = await Transaction.findOneAndUpdate(
    {
      reference: paymentData.accountReference,
      status: { $ne: 'success' },
    },
    {
      $set: {
        amount: paymentData.orderAmount / 100,
        status: 'success',
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
    { new: true }
  );

  if (!transaction) {
    const user = await User.findOne({
      'accountDetails.accountNumber': paymentData.virtualAccountNo,
    });

    if (!user) {
      console.error(`User not found for VA: ${paymentData.virtualAccountNo}`);
      return;
    }

    const accountReference = generateRandomReference('DEP', user.firstName);

    transaction = await Transaction.create({
      user: user._id,
      reference: accountReference,
      type: 'credit',
      serviceType: 'deposit',
      amount: paymentData.orderAmount / 100,
      status: 'success',
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
    });

    user.transactions.push(transaction._id);
    await user.save();
  }

  await User.findByIdAndUpdate(transaction.user, {
    $inc: { accountBalance: paymentData.orderAmount / 100 },
  });

  await logUserActivity(transaction.user, 'deposit', {
    amount: paymentData.orderAmount / 100,
    transactionId: paymentData.orderNo,
    paymentMethod: `${paymentData.payerBankName} (${paymentData.payerAccountNo})`,
  });

  console.log(
    `Processed successful payment for transaction ${paymentData.orderNo}`
  );
}

async function handlePaymentFailed(event) {
  const { transactionId, merchantReference, reason } = event.data;

  const transaction = await Transaction.findOne({
    reference: merchantReference,
  });

  if (!transaction) {
    throw new ApiError(404, false, 'Transaction not found');
  }

  transaction.status = 'failed';
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
    'metadata.boldDataTransactionId': originalTransactionId,
  });

  if (!transaction) {
    throw new ApiError(404, false, 'Original transaction not found');
  }

  const chargeback = new Transaction({
    type: 'debit',
    serviceType: 'chargeback',
    amount,
    status: 'completed',
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
    await logUserActivity(user._id, 'chargeback', {
      amount,
      originalTransactionId,
      newBalance: user.balance,
    });
  }

  console.log(`Processed chareback for transaction ${originalTransactionId}`);
}

export const queryBiller = async (req, res, next) => {
  try {
    const { sceneCode } = req.body;

    if (!sceneCode) {
      throw new ApiError(400, false, 'Scene code is required');
    }
    const nonceStr = generateNonceStr();

    const payload = {
      sceneCode,
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
      `${process.env.PALMPAY_BASE_URL}/api/v2/bill-payment/biller/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json',
          CountryCode: 'NG',
          Signature: generatedSignature,
        },
      }
    );

    if (response.status !== 200) {
      throw new ApiError(
        400,
        false,
        'Failed to fetch biller details',
        response.data
      );
    }

    console.log(response.data);

    const { data } = response.data;

    if (!data) {
      throw new ApiError(404, false, 'Biller not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Biller fetched successfully',
      data,
    });
  } catch (error) {
    console.error(
      'Failed to fetch biller details',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const queryBillerItem = async (req, res, next) => {
  try {
    const { sceneCode, billerId } = req.body;

    if (!sceneCode) {
      throw new ApiError(400, false, 'Scene code is required');
    }

    if (!billerId) {
      throw new ApiError(400, false, 'Biller ID is required');
    }

    const nonceStr = generateNonceStr();

    const payload = {
      sceneCode,
      billerId,
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
      `${process.env.PALMPAY_BASE_URL}/api/v2/bill-payment/item/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json',
          CountryCode: 'NG',
          Signature: generatedSignature,
        },
      }
    );
    if (response.status !== 200) {
      throw new ApiError(
        400,
        false,
        'Failed to fetch biller item details',
        response.data
      );
    }
    const { data } = response.data;
    if (!data) {
      throw new ApiError(404, false, 'Biller item not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Biller item fetched successfully',
      data,
    });
  } catch (error) {
    console.error(
      'Failed to fetch biller item details',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const accountReference = generateRandomReference('ORDER', 'john');

    const nonceStr = generateNonceStr();

    const payload = {
      requestTime: Date.now(),
      version: 'V1.1',
      nonceStr,
      amount: amount * 100,
      notifyUrl: 'https://www.bolddatapay.com/callback/payment',
      orderId: process.env.PALMPAY_ORDER_ID,
      title: 'Deposit',
      description: 'Add money to bold data account',
      userId: accountReference,
      currency: 'NGN',
      callBackUrl: process.env.FRONTEND_BASE_URL,
      productType: 'bank_transfer',
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
      `${process.env.PALMPAY_BASE_URL}/api/v2/payment/merchant/createorder`,
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

    console.log(response.data);
    res.status(200).json({
      success: true,
      message: 'order created successfully',
      data: response.data,
    });
  } catch (error) {
    console.log('failed to create order', error);
    next(error);
  }
};

export const createBankTransferOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    if (!amount || amount <= 0) {
      throw new ApiError(400, false, 'Amount must be a positive number');
    }

    const accountReference = generateRandomReference(
      'BT_ORDER',
      user.firstName
    );

    const transaction = await Transaction.create({
      user: user._id,
      reference: accountReference,
      type: 'credit',
      serviceType: 'bank_transfer',
      amount,
      status: 'pending',
      metadata: {
        paymentMethod: 'bank_transfer',
        initiatedAt: new Date(),
      },
    });

    user.transactions.push(transaction._id);
    await user.save();

    const nonceStr = generateNonceStr();
    const payload = {
      requestTime: Date.now(),
      version: 'V1.1',
      nonceStr,
      amount: amount * 100,
      notifyUrl: `${process.env.BASE_URL}/api/deposit/bank-transfer/webhook`,
      orderId: accountReference, // Using our reference as orderId
      title: 'Deposit to BoldData',
      description: `Deposit of ${amount} NGN to ${user.firstName}'s account`,
      userId: user._id.toString(),
      currency: 'NGN',
      callBackUrl: `https://www.bolddatahub.com/home`,
      productType: 'bank_transfer',
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/payment/merchant/createorder`,
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

    transaction.metadata.palmPayReference = response.data.data?.orderNo;
    await transaction.save();

    await logUserActivity(user._id, 'payment', {
      details: 'Bank transfer deposit initiated',
      amount: amount,
      reference: accountReference,
    });

    res.status(200).json({
      success: true,
      message: 'Bank transfer order created successfully',
      data: {
        ...response.data.data,
        ourReference: accountReference,
      },
    });
  } catch (error) {
    console.log('Failed to create bank transfer order', error);
    next(error);
  }
};

export const handleBankTransferWebhook = async (req, res, next) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const requestIp = forwarded ? forwarded.split(',')[0].trim() : req.ip;

    // if (requestIp !== process.env.PALMPAY_IP) {
    //   throw new ApiError(403, false, 'Unauthorized request origin');
    // }

    const isVerified = rsaVerify(
      md5(sortParams(req.body)).toUpperCase(),
      req.body.sign,
      process.env.PALMPAY_PUBLIC_KEY,
      'SHA1withRSA'
    );

    // if (!isVerified) {
    //   throw new ApiError(403, false, 'Invalid signature');
    // }

    if (req.body.status !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Webhook received but not processed (non-successful payment)',
      });
    }

    const existing = await Transaction.findOne({
      'metadata.palmPayOrderNo': req.body.orderNo,
      status: 'success',
    });

    if (existing) {
      return res.status(200).json({ success: true });
    }

    await handleBankTransferPaymentSuccess(req.body);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Bank transfer webhook error:', error);
    next(error);
  }
};

async function handleBankTransferPaymentSuccess(paymentData) {
  const transaction = await Transaction.findOneAndUpdate(
    {
      reference: paymentData.orderId,
      status: { $ne: 'success' },
    },
    {
      $set: {
        amount: paymentData.amount / 100,
        status: 'success',
        completedAt: new Date(),
        metadata: {
          ...paymentData,
          processedAt: new Date(),
          palmPayOrderNo: paymentData.orderNo,
        },
      },
    },
    { new: true }
  );

  if (!transaction) {
    console.error(
      `Transaction not found for reference: ${paymentData.orderId}`
    );
    return;
  }

  const user = await User.findByIdAndUpdate(
    transaction.user,
    {
      $inc: { accountBalance: paymentData.amount / 100 },
    },
    { new: true }
  );

  if (!user) {
    console.error(`User not found for transaction: ${transaction._id}`);
    return;
  }

  await logUserActivity(user._id, 'payment', {
    details: 'Bank transfer deposit completed',
    amount: paymentData.amount / 100,
    reference: transaction.reference,
  });

  console.log(
    `Processed bank transfer payment for order ${paymentData.orderNo}`
  );
}

export const checkBankTransferStatus = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const user = req.user;

    const transaction = await Transaction.findOne({
      reference,
      user: user._id,
      serviceType: 'bank_transfer',
    });

    if (!transaction) {
      throw new ApiError(404, false, 'Transaction not found');
    }

    if (transaction.status === 'success') {
      return res.status(200).json({
        success: true,
        data: transaction,
      });
    }

    const nonceStr = generateNonceStr();
    const payload = {
      requestTime: Date.now(),
      version: 'V1.1',
      nonceStr,
      orderNo: transaction.metadata.palmPayReference || reference,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/payment/merchant/queryorder`,
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

    const orderStatus = response.data.data?.orderStatus;

    if (orderStatus === 1) {
      await handleBankTransferPaymentSuccess({
        ...response.data.data,
        orderId: reference,
      });

      const updatedTransaction = await Transaction.findOne({
        reference,
        user: user._id,
      });

      return res.status(200).json({
        success: true,
        data: updatedTransaction,
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Failed to check bank transfer status:', error);
    next(error);
  }
};
