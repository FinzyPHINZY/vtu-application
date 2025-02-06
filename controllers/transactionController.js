import axios from 'axios';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';
import {
  isValidPhoneNumber,
  processTransaction,
  sendTransactionReceipt,
  validateBalance,
} from '../utils/transaction.js';

export const purchaseAirtime = async (req, res, next) => {
  try {
    const {
      network,
      amount,
      mobile_number,
      Ported_number,
      airtime_type = 'VTU',
    } = req.body;

    // Validate request body
    if (!network || !amount || !mobile_number || Ported_number === undefined) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    // Validate amount range
    if (amount < 50 || amount > 50000) {
      throw new ApiError(
        400,
        false,
        'Amount must be between 50 and 50000 Naira'
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(mobile_number)) {
      throw new ApiError(
        400,
        false,
        'Invalid phone number format. Must be in format 08XXXXXXXXX'
      );
    }

    // Validate network ID
    if (![1, 2, 3, 4].includes(network)) {
      throw new ApiError(400, false, 'Invalid network provider ID');
    }

    const user = await validateBalance(req.user.id, amount);

    const reference = generateRandomReference('AIR', user.firstName);

    const transactionDetails = {
      reference,
      serviceType: 'airtime',
      metadata: {
        network,
        mobile_number,
        airtime_type,
        Ported_number,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('purchasing airtime');

    try {
      // Make request to DataStation API
      const response = await axios.post(
        'https://datastationapi.com/api/topup/',
        {
          network,
          amount,
          mobile_number,
          Ported_number,
          airtime_type,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      // Check transaction status
      const statusResponse = await axios.get(
        `https://datastationapi.com/api/data/${response.data.transaction_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      // Send receipt
      console.log(`Airtime purchase successful for user: ${req.user.id}`);

      // Update transaction based on status
      if (statusResponse.data.status === 'successful') {
        transaction.status = 'success';
        await user.save();

        // Send receipt
        await sendTransactionReceipt(user, transaction);

        console.log(`Airtime purchase successful for user: ${req.user.id}`);

        return res.status(200).json({
          success: true,
          message: 'Airtime purchase successful',
          data: {
            reference: transaction.reference,
            amount,
            network,
            mobile_number,
            status: transaction.status,
            timestamp: transaction.createdAt,
          },
        });
      } else if (statusResponse.data.status === 'failed') {
        // Reverse the transaction
        user.accountBalance += amount;
        transaction.status = 'failed';
        transaction.failureReason =
          statusResponse.data.message || 'Transaction failed';
        await user.save();

        throw new ApiError(
          400,
          false,
          'Airtime purchase failed',
          statusResponse.data
        );
      } else {
        // Transaction is still processing
        return res.status(202).json({
          success: true,
          message: 'Airtime purchase is processing',
          data: {
            reference: transaction.reference,
            transactionId: response.data.transaction_id,
            amount,
            network,
            mobile_number,
            status: 'pending',
            timestamp: transaction.createdAt,
          },
        });
      }
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
        error.response?.data?.message || 'Airtime purchase failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Airtime purchase failed:', error);
    next(error);
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
    if (![1, 2, 3, 4].includes(network)) {
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
          reference: transactionDoc.reference,
          amount,
          network,
          mobile_number,
          plan,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      // Handle failed API call
      console.error('DataStation API call failed:', error);

      // Reverse the transaction
      user.accountBalance += amount;
      transaction.status = 'failed';
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

export const payCableTV = async (req, res, next) => {
  try {
    const { cablename, cableplan, smart_card_number, amount } = req.body;

    // Validate request body
    if (!cablename || !cableplan || !smart_card_number) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    // create external reference
    const reference = generateRandomReference('CAB_TV', user.firstName);

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'tvSubscription',
      metadata: {
        cablename,
        cableplan,
        smart_card_number,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('purchasing tv subscription');

    try {
      // Make request to Safe Haven API
      const response = await axios.post(
        `https://datastationapi.com/api/cablesub/`,
        {
          cablename,
          cableplan,
          smart_card_number,
        },
        {
          headers: {
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const transactionDoc = await Transaction.findById(transaction.toString());
      transactionDoc.status = 'success';

      await transactionDoc.save();
      await user.save();

      // send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log(`Cable TV Subscription successful`);

      return res.status(200).json({
        success: true,
        message: 'Cable Subscription purchase successful',
        data: {
          reference,
          amount,
          cablename,
          cableplan,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      console.error('Cable Subscription Failed: ', error);

      user.accountBalance += amount;
      transaction.status = 'failed';
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Data purchase failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Failed to purchase cable tv subscription', error);
    next(error);
  }
};

export const payUtilityBill = async (req, res, next) => {
  try {
    const { disco_name, meter_number, amount, meterType } = req.body;

    // validate user balance
    const user = await validateBalance(req.user.id, amount);

    const reference = generateRandomReference('UTIL', user.firstName);

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'electricity',
      metadata: {
        disco_name,
        meter_number,
        meterType,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('paying utility bill');

    try {
      const response = await axios.post(
        'https://datastationapi.com/api/billpayment/',
        { disco_name, meter_number, amount, meterType },
        {
          headers: {
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
            timeout: 30000,
          },
        }
      );

      const transactionDoc = await Transaction.findById(transaction.toString());
      transactionDoc.status = 'success';

      await transactionDoc.save();
      await user.save();

      await sendTransactionReceipt(user, transactionDoc);

      console.log('Utility payment successful');

      return res.status(200).json({
        success: true,
        message: 'Utility bill payment successful',
        data: {
          reference,
          amount,
          disco_name,
          meter_number,
          amount,
          meterType,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      console.error('Utility bill payment failed: ', error);

      user.accountBalance += amount;
      transaction.status = 'failed';
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Utility bill payment failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Failed to pay utility bill', error);
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, false, 'Invalid user ID');
    }

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 }) // Sorts by latest first
      .lean(); // Optimizes query performance

    res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      transactions,
    });
  } catch (error) {
    console.error('Failed to fetch transactions', error);
    next(error); // Pass error to middleware
  }
};
