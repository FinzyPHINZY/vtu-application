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
          CountryCode: 'NG',
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
