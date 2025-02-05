import axios from 'axios';
import ApiError from '../utils/error.js';
import {
  generateRandomReference,
  generateTransferReference,
} from '../utils/helpers.js';
import {
  isValidAccountNumber,
  isValidPhoneNumber,
  processTransaction,
  sendTransactionReceipt,
  validateBalance,
} from '../utils/transaction.js';
import Transaction from '../models/Transaction.js';

export const purchaseAirtime = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, amount, phoneNumber } = req.body;

    if (!isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid phone number format' });
    }

    const user = await validateBalance(req.user.id, amount);

    const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER; //user.accountNumber,

    const reference = generateRandomReference('AIR', user.firstName);

    const transactionDetails = {
      reference,
      serviceType: 'airtime',
      metadata: {
        serviceCategoryId,
        phoneNumber,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('purchasing airtime');

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/pay/airtime`,
      {
        serviceCategoryId,
        amount,
        channel: 'WEB',
        debitAccountNumber,
        phoneNumber,
        statusUrl: `${process.env.API_BASE_URL}/webhook/transaction-status`,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const { data } = response.data;

    const transactionDoc = await Transaction.findById(transaction.toString());
    transactionDoc.status = 'success';

    await transactionDoc.save();
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transactionDoc);

    console.log(`Airtime purchase successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Airtime purchase successful',
      data,
    });
  } catch (error) {
    console.log('Failed to purchase airtime', error.response);

    // Handle known errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

export const purchaseData = async (req, res, next) => {
  try {
    const { network, mobile_number, plan, Ported_number, amount } = req.body;

    // Validate request body
    if (!network || !mobile_number || !plan || Ported_number === undefined) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    // validate phone number
    if (!isValidPhoneNumber(mobile_number)) {
      throw new ApiError(
        400,
        false,
        'Invalid phone number format. Must be in format 0XXXXXXXXXX'
      );
    }

    // Validate network ID (assuming valid network IDs are 1-4)
    if (![1, 2, 3, 4, 5].includes(network)) {
      throw new ApiError(400, false, 'Invalid network provider ID');
    }

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    // create reference
    const reference = generateRandomReference('DAT', user.firstName);

    // process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'data',
      metadata: {
        network,
        mobile_number,
        plan,
        Ported_number,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    const token = process.env.DATASTATION_AUTH_TOKEN;

    console.log('this s token', token);

    console.log('purchasing data');

    try {
      // Make request to DataStation API
      const response = await axios.post(
        'https://datastationapi.com/api/data/',
        {
          network,
          mobile_number,
          plan,
          Ported_number,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      // update transaction status
      const transactionDoc = await Transaction.findById(transaction.toString());
      transactionDoc.status = 'success';

      await transactionDoc.save();
      await user.save();

      // send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log(`Data bundle purchase successful for user: ${req.user.id}`);

      return res.status(200).json({
        success: true,
        message: 'Data purchase successful',
        data: {
          reference: transaction.reference,
          amount,
          network,
          mobile_number,
          plan,
          status: transaction.status,
          timestamp: transaction.createdAt,
        },
      });
    } catch (error) {
      // Handle failed API call
      console.error('DataStation API call failed:', error);

      // Reverse the transaction
      user.accountBalance += amount;
      transaction.status = 'failed';
      transaction.failureReason =
        error.response?.data?.message || 'Provider API error';
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Data purchase failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Failed to purchase data', error);

    next(error);
  }
};

export const payCableTV = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, bundleCode, amount, cardNumber } = req.body;

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER; //user.accountNumber,

    // create external reference
    const reference = generateRandomReference('CAB_TV', user.firstName);

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'tvSubscription',
      metadata: {
        serviceCategoryId,
        bundleCode,
        cardNumber,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('purchasing tv subscription');

    // Make request to Safe Haven API
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/pay/cable-tv`,
      {
        serviceCategoryId,
        bundleCode,
        amount,
        channel: 'WEB',
        debitAccountNumber,
        cardNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    if (response.data.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: 'Failed to buy cable tv package. Please try again.',
      });
    }

    const { data } = response.data;

    const transactionDoc = await Transaction.findById(transaction.toString());
    transactionDoc.status = 'success';

    await transactionDoc.save();
    await user.save();

    // send transaction receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Cable TV payment successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Cable TV payment successful',
      data,
    });
  } catch (error) {
    console.error('Failed to Purchase TV Subscription', error);

    // Handle known errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const payUtilityBill = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, meterNumber, amount, vendType } = req.body;

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER; //user.accountNumber,

    const reference = generateRandomReference('UTIL', user.firstName);

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'electricity',
      metadata: {
        serviceCategoryId,
        meterNumber,
        vendType,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('paying utility bill');

    // Make request to Safe Haven API
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/pay/utility`,
      {
        serviceCategoryId,
        meterNumber,
        amount,
        channel: 'WEB',
        debitAccountNumber,
        vendType,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const { data } = response.data;

    // Update transaction status
    const transactionDoc = await Transaction.findById(transaction.toString());
    transactionDoc.status = 'success';

    await transactionDoc.save();
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transactionDoc);

    console.log(`Utility bill payment successful for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Utility bill payment successful',
      data,
    });
  } catch (error) {
    console.error('Failed to pay utility bill', error);

    // Handle known errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const transferFunds = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      nameEnquiryReference,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
    } = req.body;

    const paymentReference = generateTransferReference();

    const payload = {
      nameEnquiryReference,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference,
    };

    if (!isValidAccountNumber(beneficiaryAccountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid  beneficiary account number',
      });
    }

    const user = await validateBalance(req.user.id, amount);

    const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER; //user.accountNumber,

    const reference = generateRandomReference('TRF', user.firstName);

    const transactionDetails = {
      reference,
      serviceType: 'transfer',
      metadata: {
        beneficiaryAccountNumber,
        beneficiaryBankCode,
        nameEnquiryReference,
        amount,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('making transfers');

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response.data;

    const transactionDoc = await Transaction.findById(transaction.toString());
    transactionDoc.status = 'success';

    await transactionDoc.save();
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transactionDoc);

    console.log(`Transfer to ${beneficiaryAccountNumber} successful`);

    return res.status(200).json({
      success: true,
      message: 'Fund transfer successful',
      data,
    });
  } catch (error) {
    console.log('Failed to transfer funds', error);

    // Handle known errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res
      .status('500')
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/transactions`,
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

    console.log('VAS transactions fetched successfully');

    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: data,
    });
  } catch (error) {
    console.error('Failed to fetch VAS transactions:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/transaction/${id}`,
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

    console.log(`VAS transaction ${id} fetched successfully`);

    return res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error(`Failed to fetch VAS transaction ${req.params.id}:`, error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transaction' });
  }
};
