import axios from 'axios';
import User from '../models/User.js';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';
import { generateNonceStr, generateSignature } from '../services/palmpay.js';
import { formatKey, rsaVerify, sign, sortParams } from '../palmpay.js';
import md5 from 'md5';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the correct path to the private key
const privateKeyPath = path.join(__dirname, './private_key.pem');
const publicKeyPath = path.join(__dirname, './public_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

export const createVirtualAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    const accountReference = generateRandomReference('VIR_ACC', user.firstName);
    const nonceStr = generateNonceStr();

    const payload = {
      virtualAccountName: `${user.firstName} ${user.lastName}`,
      identityType: 'company',
      licenceNumber: 'RC12345',
      email: user.email,
      customerName: `${user.firstName} ${user.lastName}`,
      accountReference,
      version: 'V2.0',
      requestTime: Date.now(),
      nonceStr,
    };

    // const generatedSignature = sign(payload, formatKey(privateKey, 'private'));

    const generatedSignature = sign(payload, privateKey);

    const isVerified = rsaVerify(
      md5(sortParams(payload)).toUpperCase(),
      generatedSignature,
      publicKey,
      'SHA1withRSA'
    );
    console.log('Signature Verified:', isVerified);

    console.log(process.env.PALMPAY_APP_ID === 'L250320160232739149981');

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

    const { data } = response;

    console.log(data);

    return res.status(200).json({
      success: true,
      message: 'Virtual Account created successfully',
      data,
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

    const nonceStr = generateNonceStr();

    const payload = {
      requestTime: Date.now(),
      version: 'V2.0',
      virtualAccountNo,
      status: 'Disabled',
      nonceStr,
    };

    const Signature = generateSignature(payload);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/update`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          CountryCode: 'NG',
          'Content-Type': 'application/json;charset=UTF-8',
          Signature,
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

    const Signature = generateSignature(payload);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/delete`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json;charset=UTF-8',
          CountryCode: 'NG',
          Signature,
        },
      }
    );

    const { data } = response;
    console.log(data);

    return res.status(200).json({
      success: true,
      message: 'Deleted virtual account successfully',
      data,
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

    const nonceStr = generateNonceStr;

    const payload = {
      requestTime: Date.now(),
      nonceStr,
      version: 'V2.0',
      virtualAccountNo,
    };

    const Signature = generateSignature(payload);

    const response = await axios.post(
      `${process.env.PALMPAY_BASE_URL}/api/v2/virtual/account/label/queryOne`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PALMPAY_APP_ID}`,
          'Content-Type': 'application/json;charset=UTF-8',
          CountryCode: 'NG',
          Signature,
        },
      }
    );

    const { data } = response;
    console.log(data);

    return res.status(200).json({
      success: true,
      message: 'Virtual account fetched successfully',
      data,
    });
  } catch (error) {
    console.error(
      'Failed to fetch virtual account details',
      error?.response || error?.message || error
    );

    next(error);
  }
};
