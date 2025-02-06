import axios from 'axios';
import User from '../models/User.js';
import { generateRandomReference } from '../utils/helpers.js';

export const createSubAccount = async (req, res) => {
  const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

  try {
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
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.accountNumber) {
      return res
        .status(409)
        .json({ success: false, message: 'User already has a sub-account' });
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
      callbackUrl: process.env.FRONTEND_BASE_URL,
      autoSweep: true,
      autoSweepDetails: { schedule: 'Instant' },
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

    const { data } = response.data;

    user.accountNumber = data.accountNumber;
    user.accountDetails = {
      bankName: data.bankName,
      accountName: data.accountName,
      accountType: data.accountType,
      accountBalance: data.accountBalance,
      accountId: data._id,
      status: data.status,
    };

    await user.save();

    console.log(`Sub-account created successfully for user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Sub-account created successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        hasSetTransactionPin: user.hasSetTransactionPin,
        isVerified: user.isVerified,
        status: user.status,
        isGoogleUser: user.isGoogleUser,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        accountType: data.accountType,
        accountNumber: data.accountNumber,
        status: data.status,
        createdAt: data.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

export const getAccountDetails = async (req, res) => {
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

    const { data } = response.data;

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

export const getAccounts = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { page = 0, limit = 100, isSubAccount = false } = req.query;

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
