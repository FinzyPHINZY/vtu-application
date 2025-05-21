import axios from 'axios';
import ApiError from '../utils/error.js';
import { sign } from '../palmpay.js';
import { generateNonceStr } from '../services/palmpay.js';
import verificationQueue from '../queues/verificationQueue.js';

const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER;

// Initiate Verification
export const initiateVerification = async (req, res) => {
  const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;
  try {
    const { number } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2`,
      {
        number,
        async: false,
        type: 'BVN',
        debitAccountNumber,
      },
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

    res.status(200).json({
      success: true,
      message: 'Verification initiated successfully',
      data,
    });
  } catch (error) {
    console.error('Error initiating verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Validate Verification
export const validateVerification = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { identityId, otp } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2/validate`,
      {
        identityId,
        otp,
        type: 'BVN',
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data, statusCode, message } = response.data;

    if (statusCode === 400) {
      throw new ApiError(statusCode, false, message);
    }

    const phoneNumber = data.providerResponse.phoneNumber1;

    const maskedNumber = `${phoneNumber.slice(0, 3)}xxxx${phoneNumber.slice(
      -3
    )}`;

    res.status(200).json({
      statusCode: 200,
      data: {
        _id: data._id,
        clientId: data.clientId,
        type: data.type,
        amount: data.amount,
        status: data.status,
        maskedNumber,
        debitAccountNumber: data.debitAccountNumber,
        transaction: data.transaction,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      message: data.message || 'Verification validated successfully',
    });
  } catch (error) {
    console.error('Error validating verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const ninEnquiry = async (req, res) => {
  try {
    const { nin } = req.body;

    if (!nin) {
      throw new ApiError(400, false, 'NIN is required');
    }

    const nonceStr = generateNonceStr();

    const payload = {
      version: 'V1.1',
      nonceStr,
      requestTime: Date.now(),
      nin,
    };

    const generatedSignature = sign(payload, process.env.EASE_ID_PRIVATE_KEY);

    const response = await axios.post(
      `${process.env.EASE_ID_BASE_URL}/api/validator-service/open/nin/inquire`,
      { nin },
      {
        headers: {
          Authorization: `Bearer ${process.env.EASE_ID_APP_ID}`,
          CountryCode: 'NG',
          'Content-Type': 'application/json',
          Signature: generatedSignature,
        },
      }
    );

    console.log(response.data);

    return res.status(200).json({
      success: true,
      message: 'NIN verification successful',
      data: response.data,
    });
  } catch (error) {
    console.error('NIN verification failed: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const bvnEnquiry = async (req, res) => {
  try {
    const { type, number } = req.body;

    if (!['BVN', 'NIN'].includes(type)) {
      throw new ApiError(400, false, 'ID type is required');
    }

    await verificationQueue.add('verify-and-assign-account', {
      type,
      number,
      userId: req.user.id,
    });

    return res.status(202).json({
      success: true,
      message: `${type} verification started. You’ll be notified when it’s complete.`,
    });
  } catch (error) {
    console.error('Verification failed: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
