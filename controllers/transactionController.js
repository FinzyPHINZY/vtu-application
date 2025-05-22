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
import CablePlan from '../models/CablePlan.js';
import CableList from '../models/CableList.js';
import DataPlan from '../models/DataPlans.js';
import ElectricityCompany from '../models/ElectricityCompanies.js';
import NetworkList from '../models/Networklist.js';
import { logUserActivity } from '../utils/userActivity.js';
import ogDams from '../models/Ogdams.js';
import Setting from '../models/Settings.js';

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
      amount, // For airtime, amount = sellingPrice since no profit
      sellingPrice: amount, // Explicitly setting sellingPrice
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

    const transactionDoc = await Transaction.findById(transaction.toString());

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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      const { Status, api_response } = response.data;

      if (Status !== 'successful') {
        throw new ApiError(
          400,
          false,
          'Failed from provider. Try again',
          api_response
        );
      }

      console.log(`Airtime purchase successful for user: ${req.user.id}`);

      // Update transaction based on status
      transactionDoc.status = 'success';
      transactionDoc.completedAt = new Date();
      transactionDoc.processingTime =
        transactionDoc.completedAt - transactionDoc.createdAt;

      await transactionDoc.save();
      await user.save();

      // Send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log(`Airtime purchase successful for user: ${req.user.id}`);

      await logUserActivity(user._id, 'topup', { amount });

      return res.status(200).json({
        success: true,
        message: 'Airtime purchase successful',
        data: {
          reference: transactionDoc.reference,
          amount,
          network,
          mobile_number,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
          processingTime: transactionDoc.processingTime,
        },
      });
    } catch (error) {
      // Handle failed API call
      console.error(
        'DataStation API call failed:',
        error.response?.data || error.message
      );

      // Reverse the transaction
      user.accountBalance += amount;
      transactionDoc.status = 'failed';
      transactionDoc.failureReason =
        error.response?.data?.message || 'Provider API failure';

      await transactionDoc.save();
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
    const { network, mobile_number, plan, Ported_number } = req.body;

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

    // Get the plan details including sellingPrice
    const planDoc = await DataPlan.findOne({
      data_id: plan,
      isAvailable: true,
    });

    if (!planDoc) {
      throw new ApiError(404, false, 'Data plan not found or unavailable');
    }

    // validate user balance
    const user = await validateBalance(req.user.id, planDoc.sellingPrice);

    // create reference
    const reference = generateRandomReference('DAT', user.firstName);

    const profit = planDoc.sellingPrice - planDoc.amount;

    // process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'data',
      amount: planDoc.amount,
      sellingPrice: planDoc.sellingPrice,
      profit,
      metadata: {
        network,
        mobile_number,
        Ported_number,
        plan: {
          id: planDoc.data_id,
          name: planDoc.planType,
          size: planDoc.size,
          validity: planDoc.validity,
          costPrice: planDoc.amount,
          sellingPrice: planDoc.sellingPrice,
          profit,
        },
      },
    };

    const transaction = await processTransaction(
      user,
      planDoc.sellingPrice,
      transactionDetails
    );

    const transactionDoc = await Transaction.findById(transaction.toString());

    console.log('purchasing data');

    try {
      // Make request to DataStation API
      const response = await axios.post(
        'https://datastationapi.com/api/data/',
        {
          network,
          mobile_number,
          plan: planDoc.data_id,
          Ported_number,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      const { Status, api_response } = response.data;

      if (Status !== 'successful') {
        throw new ApiError(
          400,
          false,
          'Failed from provider. Try again',
          api_response
        );
      }
      // update transaction status
      transactionDoc.status = 'success';
      transactionDoc.completedAt = new Date();
      transactionDoc.processingTime =
        transactionDoc.completedAt - transactionDoc.createdAt;

      await transactionDoc.save();
      await user.save();

      // send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log(`Data bundle purchase successful for user: ${req.user.id}`);

      await logUserActivity(user._id, 'data', { amount: planDoc.sellingPrice });

      return res.status(200).json({
        success: true,
        message: 'Data purchase successful',
        data: {
          reference: transactionDoc.reference,
          amount: planDoc.sellingPrice,
          costPrice: planDoc.amount,
          network,
          profit,
          mobile_number,
          plan: {
            id: planDoc.data_id,
            name: planDoc.planType,
            size: planDoc.size,
            validity: planDoc.validity,
          },
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      // Handle failed API call
      console.error('DataStation API call failed:', error.data);

      // Reverse the transaction
      user.accountBalance += planDoc.sellingPrice;
      transactionDoc.status = 'failed';
      transactionDoc.failureReason =
        error.response?.data?.message || 'Provider API failure';

      await transactionDoc.save();
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

    const planDoc = await CablePlan.findOne({
      cablePlanID: cableplan,
      cablename,
      isAvailable: true,
    });

    if (!planDoc) {
      throw new ApiError(404, false, 'Cable plan not found or unavailable');
    }

    // validate user balance
    const user = await validateBalance(req.user.id, planDoc.sellingPrice);

    // create external reference
    const reference = generateRandomReference('CAB_TV', user.firstName);

    const profit = planDoc.sellingPrice - planDoc.amount;

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'tvSubscription',
      amount: planDoc.amount,
      sellingPrice: planDoc.sellingPrice,
      profit,
      metadata: {
        cablename,
        cableplan: {
          id: planDoc.cablePlanID,
          name: planDoc.cablename,
          costPrice: planDoc.amount,
          sellingPrice: planDoc.sellingPrice,
          profit,
        },
        smart_card_number,
      },
    };

    const transaction = await processTransaction(
      user,
      planDoc.sellingPrice,
      transactionDetails
    );

    console.log('purchasing tv subscription');

    const transactionDoc = await Transaction.findById(transaction.toString());

    try {
      // Make request to Safe Haven API
      const response = await axios.post(
        'https://datastationapi.com/api/cablesub/',
        {
          cablename,
          cableplan: planDoc.cablePlanID,
          smart_card_number,
        },
        {
          headers: {
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { Status, api_response } = response.data;

      if (Status !== 'successful') {
        throw new ApiError(
          400,
          false,
          'Failed from provider. Try again',
          api_response
        );
      }

      transactionDoc.status = 'success';
      transactionDoc.completedAt = new Date();
      transactionDoc.processingTime =
        transactionDoc.completedAt - transactionDoc.createdAt;

      await transactionDoc.save();
      await user.save();

      // send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log('Cable TV Subscription successful');

      await logUserActivity(user._id, 'cable_tv', {
        amount: planDoc.sellingPrice,
      });

      return res.status(200).json({
        success: true,
        message: 'Cable Subscription purchase successful',
        data: {
          reference,
          amount: planDoc.sellingPrice, // Return selling price
          costPrice: planDoc.amount, // Original cost
          profit,
          cablename,
          plan: {
            id: planDoc.cablePlanID,
            name: planDoc.cablename,
          },
          smart_card_number,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      console.error('Cable Subscription Failed: ', error);

      user.accountBalance += amount;
      transactionDoc.status = 'failed';
      transactionDoc.failureReason =
        error.response?.data?.message || 'Provider API failure';
      await transactionDoc.save();
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Cable Subscription failed',
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
    const {
      disco_name,
      meter_number,
      amount: originalAmount,
      meterType,
    } = req.body;

    if (!disco_name || !meter_number || !originalAmount || !meterType) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    // Validate amount
    if (originalAmount <= 0) {
      throw new ApiError(400, false, 'Amount must be greater than 0');
    }

    const discountPercent =
      (await Setting.getSetting('UTILITY_DISCOUNT_PERCENT')) || 0;

    const discountSetting = await Setting.findOne({
      key: 'utility_bill_discount_percentage',
    }).lean();

    const discountPercentage = Number(discountSetting?.value) || 0;

    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new ApiError(400, false, 'Invalid discount percentage');
    }

    const discountedAmount = originalAmount * (1 - discountPercentage / 100);
    const discountValue = originalAmount - discountedAmount;

    // validate user balance
    const user = await validateBalance(req.user.id, originalAmount);

    const reference = generateRandomReference('UTIL', user.firstName);

    // Process the transaction
    const transactionDetails = {
      reference,
      serviceType: 'electricity',
      amount: originalAmount, // Original amount
      sellingPrice: discountedAmount, // Same as amount for utility bills
      metadata: {
        discount: {
          percentage: discountPercentage,
          value: discountValue,
        },
        disco_name,
        meter_number,
        meterType,
      },
    };

    const transaction = await processTransaction(
      user,
      originalAmount,
      transactionDetails
    );

    console.log('paying utility bill');

    const transactionDoc = await Transaction.findById(transaction.toString());

    try {
      const response = await axios.post(
        'https://datastationapi.com/api/billpayment/',
        {
          disco_name,
          meter_number,
          amount: discountedAmount,
          meterType,
        },
        {
          headers: {
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      const { Status, api_response } = response.data;

      if (Status !== 'successful') {
        throw new ApiError(
          400,
          false,
          'Failed from provider. Try again',
          api_response
        );
      }

      transactionDoc.status = 'success';
      transactionDoc.completedAt = new Date();
      transactionDoc.processingTime =
        transactionDoc.completedAt - transactionDoc.createdAt;

      await transactionDoc.save();
      await user.save();

      await sendTransactionReceipt(user, transactionDoc);

      console.log('Utility payment successful');

      await logUserActivity(user._id, 'utility', { amount, disco_name });

      return res.status(200).json({
        success: true,
        message: 'Utility bill payment successful',
        data: {
          reference: transactionDoc.reference,
          amountPaid: originalAmount,
          amountSentToProvider: discountedAmount,
          discountPercentage,
          disco_name,
          meter_number,
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
          processingTime: transactionDoc.processingTime,
        },
      });
    } catch (error) {
      console.error('Utility bill payment failed: ', error);

      user.accountBalance += amount;
      transactionDoc.status = 'failed';
      transactionDoc.failureReason =
        error.response?.data?.message || 'Provider API failure';

      await transactionDoc.save();
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

export const getCablePlans = async (req, res, next) => {
  try {
    const { cablename } = req.query; // Optional filtering by provider

    const filter = {};
    if (cablename) {
      filter.cablename = cablename;
    }

    const plans = await CablePlan.find(filter)
      .sort({ sellingPrice: 1, cablePlanID: 1 })
      .select('-__v -createdAt -updatedAt');

    // res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    res.json({
      success: true,
      message: 'Cable plans retrieved successfully',
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);

    // More specific error handling
    if (error.name === 'CastError') {
      return next(new ApiError(400, false, 'Invalid query parameters'));
    }

    next(new ApiError(500, false, 'Failed to retrieve cable plans'));
  }
};

export const getCableList = async (req, res, next) => {
  try {
    const data = await CableList.find().sort({ cable_id: 1 });

    res.json({
      success: true,
      message: 'Cable list options retrieved successfully',
      data: data,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);
    next(error);
  }
};

export const getElectricityCompanies = async (req, res, next) => {
  try {
    const providers = await ElectricityCompany.find().sort({ disco_id: 1 });

    res.json({
      success: true,
      message: 'Electricity providers retrieved successfully',
      data: providers,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);
    next(error);
  }
};

export const fetchDataPlans = async (req, res, next) => {
  try {
    const { network } = req.query; // Optional network filter

    const filter = {};
    if (network) {
      filter.network = network;
      if (![1, 2, 3, 4].includes(Number(network))) {
        throw new ApiError(400, false, 'Invalid network provider ID');
      }
    }

    const plans = await DataPlan.find(filter)
      .sort({ sellingPrice: 1, data_id: 1 })
      .select('-__v -createdAt -updatedAt');

    // res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    res.json({
      success: true,
      message: 'Data plans retrieved successfully',
      data: plans,
      count: plans.length,
      ...(network && { filteredBy: { network } }),
    });
  } catch (error) {
    console.error('Failed to fetch data plans:', error);

    // More specific error handling
    if (error.name === 'CastError') {
      return next(new ApiError(400, false, 'Invalid query parameters'));
    }

    next(new ApiError(500, false, 'Failed to retrieve data plans'));
  }
};

export const getNetworkList = async (req, res, next) => {
  try {
    const networks = await NetworkList.find().sort({ network_id: 1 });

    res.json({
      success: true,
      message: 'Networks retrieved successfully',
      data: networks,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);
    next(error);
  }
};

export const fetchOgdamsData = async (req, res, next) => {
  try {
    const plans = await ogDams
      .find({})
      .sort({ sellingPrice: 1, planId: 1 })
      .select('-__v -createdAt -updatedAt');

    return res.status(200).json({
      success: true,
      message: 'Data plans fetched successfully',
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.log(
      'Failed to fetch data',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const purchaseOgdamsData = async (req, res, next) => {
  try {
    const { planId, phoneNumber } = req.body;

    if (!phoneNumber || !planId) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      throw new ApiError(
        400,
        false,
        'Invalid phone number format. Must be in format 0XXXXXXXXXX'
      );
    }

    const planDoc = await ogDams.findOne({
      planId,
      isAvailable: true,
    });

    if (!planDoc) {
      throw new ApiError(404, false, 'Data plan not found or unavailable');
    }

    const user = await validateBalance(req.user.id, planDoc.sellingPrice);

    const reference = generateRandomReference('DAT', user.firstName);

    const profit = planDoc.sellingPrice - planDoc.amount;

    const transactionDetails = {
      reference,
      serviceType: 'data',
      amount: planDoc.amount,
      sellingPrice: planDoc.sellingPrice,
      profit,
      metadata: {
        network: 2,
        mobile_number: phoneNumber,
        plan: {
          id: planDoc.planId,
          name: planDoc.name,
          size: planDoc.name,
          validity: planDoc.validity,
          costPrice: planDoc.amount,
          sellingPrice: planDoc.sellingPrice,
          profit,
        },
      },
    };

    const transaction = await processTransaction(
      user,
      planDoc.sellingPrice,
      transactionDetails
    );

    const transactionDoc = await Transaction.findById(transaction.toString());

    console.log('purchasing data');

    try {
      const payload = {
        networkId: 2,

        planId,
        phoneNumber,
        reference,
      };

      const response = await axios.post(
        `${process.env.OGDAMS_ENDPOINT}/api/v1/vend/data`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.OGDAMS_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const { status, data } = response.data;

      if (status !== true) {
        throw new ApiError(
          400,
          false,
          'Failed from provider. Try again',
          api_response
        );
      }

      // update transaction status
      transactionDoc.status = 'success';
      transactionDoc.completedAt = new Date();
      transactionDoc.processingTime =
        transactionDoc.completedAt - transactionDoc.createdAt;

      await transactionDoc.save();
      await user.save();

      // send receipt
      await sendTransactionReceipt(user, transactionDoc);

      console.log(`Data bundle purchase successful for user: ${req.user.id}`);

      await logUserActivity(user._id, 'data', { amount: planDoc.sellingPrice });

      return res.status(200).json({
        success: true,
        message: 'Data purchase successful',
        data: {
          reference: transactionDoc.reference,
          amount: planDoc.sellingPrice,
          costPrice: planDoc.amount,
          networkId: 2,
          profit,
          phoneNumber,
          plan: {
            id: planDoc.planId,
            name: planDoc.name,
            size: planDoc.size,
            validity: planDoc.validity,
          },
          status: transactionDoc.status,
          timestamp: transactionDoc.createdAt,
        },
      });
    } catch (error) {
      console.error(
        'OGDAMS API call failed:',
        error?.response || error?.message || error
      );

      // Reverse the transaction
      user.accountBalance += planDoc.sellingPrice;
      transactionDoc.status = 'failed';
      transactionDoc.failureReason =
        error.response?.data?.message || 'Provider API failure';

      await transactionDoc.save();
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Data purchase failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error(
      'Failed to purchase airtel bundle',
      error?.response || error?.message || error
    );

    next(error);
  }
};
