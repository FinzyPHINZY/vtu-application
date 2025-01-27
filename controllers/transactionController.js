import { generateTransferReference } from '../utils/helpers.js';
import {
  isValidAccountNumber,
  isValidPhoneNumber,
  processTransaction,
  sendTransactionReceipt,
  validateBalance,
} from '../utils/transaction.js';

const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER;

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

    const transactionDetails = {
      reference: `AIR${Date.now()}`,
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

    // Update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Airtime purchase successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Airtime purchase successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        phoneNumber,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.log('Failed to purchase airtime', error);

    return res
      .status('500')
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const purchaseData = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, bundleCode, amount, phoneNumber } = req.body;

    // validate phone number
    if (!isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid phone number format' });
    }

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    // process the transaction
    const transactionDetails = {
      reference: `DAT${Date.now()}`,
      serviceType: 'data',
      metadata: {
        serviceCategoryId,
        bundleCode,
        phoneNumber,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    // make purchase request to safehaven endpoint
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/pay/data`,
      {
        serviceCategoryId,
        bundleCode,
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

    // update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // send receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Data bundle purchase successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Data bundle purchase successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        bundleCode,
        phoneNumber,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to purchase data', error);

    return res
      .status(500)
      .json({ success: false, message: 'Intenal Server Error' });
  }
};

export const payCableTV = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, bundleCode, amount, cardNumber } = req.body;

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    // Process the transaction
    const transactionDetails = {
      reference: `CAB${Date.now()}`,
      serviceType: 'cable_tv',
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

    // update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // send transaction receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Cable TV payment successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Cable TV payment successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        bundleCode,
        cardNumber,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to Purchase TV Subscription', error);

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

    // Process the transaction
    const transactionDetails = {
      reference: `UTL${Date.now()}`,
      serviceType: 'utility',
      metadata: {
        serviceCategoryId,
        meterNumber,
        vendType,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(user, transactionDetails);

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

    // Update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Utility bill payment successful for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Utility bill payment successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        meterNumber,
        vendType,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to pay utility bill', error);

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
      debitAccountNumber,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference,
    };

    if (!isValidAccountNumber(debitAccountNumber)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid account number' });
    }

    if (!isValidAccountNumber(beneficiaryAccountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid  beneficiary account number',
      });
    }

    const user = await validateBalance(req.user.id, amount);

    const transactionDetails = {
      reference: `TR${Date.now()}`,
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

    // Update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Transfer to ${beneficiaryAccountNumber} successful`);

    return res.status(200).json({
      success: true,
      message: 'Fund transfer successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        beneficiaryAccountNumber,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.log('Failed to transfer funds', error);

    return res
      .status('500')
      .json({ success: false, message: 'Internal Server Error' });
  }
};
