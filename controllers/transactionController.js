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

// const executeTransfer = async (req, res, next) => {
//   try {
//     const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

//     const {
//       nameEnquiryReference,
//       beneficiaryBankCode,
//       beneficiaryAccountNumber,
//       amount,
//       saveBeneficiary = false,
//       narration = '',
//     } = req.body;

//     const user = await validateBalance(req.user.id, amount);

//     const reference = generateRandomReference('TRF', user.firstName);
//     console.log(reference);

//     const payload = {
//       nameEnquiryReference,
//       debitAccountNumber,
//       beneficiaryBankCode,
//       beneficiaryAccountNumber,
//       amount,
//       saveBeneficiary,
//       narration,
//       paymentReference: reference,
//     };

//     const transactionDetails = {
//       reference,
//       serviceType: 'bank_transfer',
//       metadata: {
//         beneficiaryAccount: beneficiaryAccountNumber,
//         beneficiaryBank: beneficiaryBankCode,
//         narration,
//       },
//     };

//     const transaction = await processTransaction(
//       user,
//       amount,
//       transactionDetails
//     );

//     console.log('Processing transfer...');

//     const transactionDoc = await Transaction.findById(transaction.toString());

//     try {
//       const response = await axios.post(
//         `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//             'Content-Type': 'application/json',
//             ClientID: ibs_client_id,
//           },
//           timeout: 30000, // 30 second timeout
//         }
//       );

//       const { data } = response;

//       transactionDoc.status = 'success';

//       await transactionDoc.save();
//       await user.save();

//       await sendTransactionReceipt(user, transactionDoc);

//       return res.status(200).json({
//         success: true,
//         message: 'Bank transfer completed successfully',
//         data,
//       });
//     } catch (error) {
//       console.error('Cable Subscription Failed: ', error);

//       transactionDoc.status = 'failed';
//       await transactionDoc.save();

//       throw new ApiError(
//         error.response?.status || 500,
//         false,
//         error.response?.data?.message || 'Transfer failed',
//         error.response?.data
//       );
//     }
//   } catch (error) {
//     console.error('Funds Transfer Failed', error.response);

//     next(error);
//   }
// };

// export const purchaseAirtime = async (req, res, next) => {
//   try {
//     const {
//       network,
//       amount,
//       mobile_number,
//       Ported_number,
//       airtime_type = 'VTU',
//     } = req.body;

//     // Validate request body
//     if (!network || !amount || !mobile_number || Ported_number === undefined) {
//       throw new ApiError(400, false, 'Missing required fields');
//     }

//     // Validate amount range
//     if (amount < 50 || amount > 50000) {
//       throw new ApiError(
//         400,
//         false,
//         'Amount must be between 50 and 50000 Naira'
//       );
//     }

//     // Validate phone number format
//     if (!isValidPhoneNumber(mobile_number)) {
//       throw new ApiError(
//         400,
//         false,
//         'Invalid phone number format. Must be in format 08XXXXXXXXX'
//       );
//     }

//     // Validate network ID
//     if (![1, 2, 3, 4].includes(network)) {
//       throw new ApiError(400, false, 'Invalid network provider ID');
//     }

//     const user = await validateBalance(req.user.id, amount);
//     const reference = generateRandomReference('AIR', user.firstName);

//     const transactionDetails = {
//       reference,
//       serviceType: 'airtime',
//       metadata: {
//         network,
//         mobile_number,
//         airtime_type,
//         Ported_number,
//       },
//     };

//     const transaction = await processTransaction(
//       user,
//       amount,
//       transactionDetails
//     );

//     const transactionDoc = await Transaction.find({ reference });

//     console.log('Deducting funds from Safe Haven account...');

//     try {
//       // Call the existing `executeTransfer` function to deduct funds
//       const transferResponse = await executeTransfer({
//         body: {
//           nameEnquiryReference: '999240250207162702270786275637',
//           debitAccountNumber: user.accountNumber, // Ensure this is set in user profile
//           beneficiaryBankCode: '999240', // Use Safe Haven’s internal code if needed
//           beneficiaryAccountNumber: process.env.VTU_SERVICE_ACCOUNT, // Your VTU provider's account
//           amount,
//           saveBeneficiary: false,
//           narration: 'Airtime Purchase',
//         },
//         user: req.user,
//       });

//       console.log(
//         'Fund deduction successful, proceeding with airtime purchase'
//       );

//       // If fund deduction is successful, make request to DataStation API
//       const response = await axios.post(
//         'https://datastationapi.com/api/topup/',
//         {
//           network,
//           amount,
//           mobile_number,
//           Ported_number,
//           airtime_type,
//         },
//         {
//           timeout: 30000,
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
//           },
//         }
//       );

//       console.log(`Airtime purchase successful for user: ${req.user.id}`);

//       // Update transaction based on status
//       transactionDoc[0].status = 'success';
//       await transactionDoc[0].save();
//       await user.save();

//       // Send receipt
//       await sendTransactionReceipt(user, transaction);

//       return res.status(200).json({
//         success: true,
//         message: 'Airtime purchase successful',
//         data: {
//           reference: transaction.reference,
//           amount,
//           network,
//           mobile_number,
//           status: transaction.status,
//           timestamp: transaction.createdAt,
//         },
//       });
//     } catch (error) {
//       console.error('Airtime purchase failed:', error.response?.data);

//       // Reverse the fund deduction if airtime purchase fails
//       console.log('Reversing fund deduction due to failure');
//       try {
//         await executeTransfer({
//           body: {
//             nameEnquiryReference: reference,
//             debitAccountNumber: process.env.VTU_SERVICE_ACCOUNT,
//             beneficiaryBankCode: '999999',
//             beneficiaryAccountNumber: user.safeHavenAccountNumber,
//             amount,
//             saveBeneficiary: false,
//             narration: 'Reversal: Airtime Purchase Failed',
//           },
//           user: req.user,
//         });
//         console.log('Fund refund successful');
//       } catch (refundError) {
//         console.error('Fund refund failed:', refundError.response?.data);
//       }

//       // Update transaction as failed
//       transactionDoc[0].status = 'failed';
//       await transactionDoc[0].save();
//       await user.save();

//       throw new ApiError(
//         error.response?.status || 500,
//         false,
//         error.response?.data?.message || 'Airtime purchase failed',
//         error.response?.data
//       );
//     }
//   } catch (error) {
//     console.error('Airtime purchase failed:', error);
//     next(error);
//   }
// };

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

    const transactionDoc = await Transaction.find({ reference });

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

      console.log(`Airtime purchase successful for user: ${req.user.id}`);

      // Update transaction based on status
      transactionDoc[0].status = 'success';
      await transactionDoc[0].save();
      await user.save();

      // Send receipt
      await sendTransactionReceipt(user, transactionDoc[0]);

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
    } catch (error) {
      // Handle failed API call
      console.error(
        'DataStation API call failed:',
        error.response?.data || error.message
      );

      // Reverse the transaction
      user.accountBalance += amount;
      transactionDoc[0].status = 'failed';
      await transactionDoc[0].save();
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

    const transactionDoc = await Transaction.findById(transaction.toString());

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
      transactionDoc.status = 'failed';
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

    const transactionDoc = await Transaction.findById(transaction.toString());

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
      transactionDoc.status = 'failed';
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

    const transactionDoc = await Transaction.findById(transaction.toString());

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
      transactionDoc.status = 'failed';

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
    const plans = await CablePlan.find().sort({ cablePlanID: 1 });

    res.json({
      success: true,
      message: 'Cable plans retrieved successfully',
      data: plans,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);

    next(error);
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
    const plans = await DataPlan.find();

    res.json({
      success: true,
      message: 'Data plans retrieved successfully',
      data: plans,
    });
  } catch (error) {
    console.error('Failed to fetch cable plans:', error);
    next(error);
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
