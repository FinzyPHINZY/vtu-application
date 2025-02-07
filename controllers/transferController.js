import axios from 'axios';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';
import {
  processTransaction,
  sendTransactionReceipt,
  validateBalance,
} from '../utils/transaction.js';
import Transaction from '../models/Transaction.js';

const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER;

export const getBankList = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    console.log('Fetching bank list');

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/banks`,
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

    if (!data.statusCode === 403) {
      throw new ApiError(400, false, data.message);
    }

    console.log('Banks list retrieved successfully');

    return res.status(201).json({
      success: true,
      message: 'Banks retrieved successfully',
      data,
    });
  } catch (error) {
    console.error(
      'Failed to get bank list',
      error.response.data.message || error.message
    );

    next(error);
  }
};

export const nameEnquiry = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { bankCode, accountNumber } = req.body;

    const payload = { bankCode, accountNumber };

    // post request to safe haven
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/name-enquiry`,
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

    console.log(data);

    if (!data.responseCode) {
      throw new ApiError(400, false, 'Name enquiry failed');
    }

    console.log(`Name enquiry successful for account: ${accountNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Name enquiry successful',
      data,
    });
  } catch (error) {
    console.error('Failed to verify account information', error);

    next(error);
  }
};

export const executeTransfer = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      nameEnquiryReference,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary = false,
      narration = '',
    } = req.body;

    const user = await validateBalance(req.user.id, amount);

    const reference = generateRandomReference('TRF', user.firstName);
    console.log(reference);

    const payload = {
      nameEnquiryReference,
      debitAccountNumber,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference: reference,
    };

    const transactionDetails = {
      reference,
      serviceType: 'bank_transfer',
      metadata: {
        beneficiaryAccount: beneficiaryAccountNumber,
        beneficiaryBank: beneficiaryBankCode,
        narration,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('Processing transfer...');

    const transactionDoc = await Transaction.findById(transaction.toString());

    try {
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

      const { data } = response;

      transactionDoc.status = 'success';

      await transactionDoc.save();
      await user.save();

      await sendTransactionReceipt(user, transactionDoc);

      return res.status(200).json({
        success: true,
        message: 'Bank transfer completed successfully',
        data,
      });
    } catch (error) {
      console.error('Cable Subscription Failed: ', error);

      transactionDoc.status = 'failed';
      await transactionDoc.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Transfer failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Funds Transfer Failed', error.response);

    next(error);
  }
};

export const checkTransferStatus = async (req, res, error) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { sessionId } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/status`,
      { sessionId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    console.log(`Transaction status checked for ${sessionId}`);

    const { data } = response.data;

    console.log('Transfer status checked successfully');

    return res.status(200).json({
      success: true,
      message: 'Transfer status fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Failed to check transfer status', error.response.data);

    next(error);
  }
};

export const getTransferHistory = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      accountId,
      page = 0,
      limit = 100,
      fromDate,
      toDate,
      type,
      status,
    } = req.params;

    const queryParams = new URLSearchParams({
      accountId,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000,
      }
    );

    console.log(`Transfer history retrieved for ${accountId}`);

    res.status(200).json({
      success: true,
      message: 'Transfer history retrieved successfully',
      data: response.data.data,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalCount: response.data.totalCount,
        totalPages: Math.ceil(response.data.totalCount / limit),
      },
    });
  } catch (error) {
    console.log('Transfer history retrieval failed', error);
    next(error);
  }
};
