import axios from 'axios';
import { Worker } from 'bullmq';
import { config } from 'dotenv';

import User from '../models/User.js';
import { sign } from '../palmpay.js';
import verificationQueue, { connection } from '../queues/verificationQueue.js';
import { generateNonceStr } from '../services/palmpay.js';
import { generateRandomReference } from '../utils/helpers.js';
import { logUserActivity } from '../utils/userActivity.js';

config();

const MATCH_THRESHOLDS = {
  EXACT: 100,
  PARTIAL: 70,
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  PARTIAL: 'partial_match',
  INVALID_ID: 'invalid_id',
  PROVIDER_ERROR: 'provider_error',
};

const PROVIDER_ERRORS = {
  SYSTEM_ERROR: 'system error, pls try again',
  INVALID_NIN: 'invalid nin',
  INVALID_BVN: 'invalid bvn',
  NOT_FOUND: 'record not found',
};

console.log('🚀 bvn worker is running...');

const mainWorkerOptions = {
  connection,
  concurrency: 5,
  removeOnFail: { count: 0 },
};

export const verificationWorker = new Worker(
  'verificationQueue',

  async (job) => {
    try {
      // console.log(job.name);
      // console.log(job.data);
      return await userEnquiry(job);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  mainWorkerOptions
);

verificationWorker.on('error', (err) => {
  console.error(`Error processing job: ${err}`);
});

const userEnquiry = async (job) => {
  const { type, number, userId } = job.data;

  if (!type || !number) {
    throw new Error('Invalid job data - provide type and number');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`⏳ Verifying ${type} for User ${user.firstName}`);

  try {
    await User.findByIdAndUpdate(userId, {
      verificationStatus: 'processing',
      verificationMetadata: {
        type,
        number,
      },
      lastVerificationAttempt: new Date(),
    });

    console.log(`⏳ Verifying ${type} ${number} for ${user.firstName}`);

    const verificationResult = await verifyUserWithProvider(type, number, user);

    await handleVerificationResult(user, verificationResult);

    console.log(`✅User ${user.firstName} verified successfully`);

    return { success: true, data: verificationResult };
  } catch (error) {
    console.error(
      `❌ Error verifying ${type} for User ${user.firstName}:`,
      error
    );
    throw error;
  }
};

const verifyUserWithProvider = async (idType, number, user) => {
  try {
    const nonceStr = generateNonceStr();

    const payload = {
      version: 'V1.1',
      nonceStr,
      requestTime: Date.now(),
      [idType.toLowerCase()]: number,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user?.phoneNumber,
    };

    const generatedSignature = sign(payload, process.env.EASE_ID_PRIVATE_KEY);

    const response = await axios.post(
      `${
        process.env.EASE_ID_BASE_URL
      }/api/validator-service/open/${idType.toLowerCase()}/verify`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.EASE_ID_APP_ID}`,
          CountryCode: 'NG',
          'Content-Type': 'application/json',
          Signature: generatedSignature,
        },
      }
    );

    const { respCode, respMsg, data } = response.data;

    if (respCode !== '00000000') {
      if (
        respMsg
          .toLowerCase()
          .includes(PROVIDER_ERRORS.SYSTEM_ERROR.toLowerCase())
      ) {
        throw new Error('PROVIDER_UNAVAILABLE');
      }
      if (
        respMsg
          .toLowerCase()
          .includes(PROVIDER_ERRORS.INVALID_NIN.toLowerCase()) ||
        respMsg
          .toLowerCase()
          .includes(PROVIDER_ERRORS.INVALID_BVN.toLowerCase())
      ) {
        throw new Error('INVALID_ID_NUMBER');
      }
      if (
        respMsg.toLowerCase().includes(PROVIDER_ERRORS.NOT_FOUND.toLowerCase())
      ) {
        throw new Error('ID_NOT_FOUND');
      }
      throw new Error(respMsg);
    }

    return {
      matchPercentage: data.namesMatchPercentage,
      matchResult: data.nameMatchRlt,
      phoneMatch: data.phoneNumberMatchRlt,
      requestId: response.data.requestId,
      rawResponse: response.data,
    };
  } catch (error) {
    if (error.response) {
      console.error(
        'Provider API error:',
        error.response.status,
        error.response.data
      );
      throw new Error(`PROVIDER_ERROR_${error.response.status}`);
    }
    throw error;
  }
};

const handleVerificationResult = async (user, result) => {
  let verificationStatus = VERIFICATION_STATUS.FAILED;
  let verificationNotes = '';

  if (result.matchPercentage >= MATCH_THRESHOLDS.EXACT) {
    verificationStatus = VERIFICATION_STATUS.VERIFIED;
    verificationNotes = 'Exact name match';
  } else if (result.matchPercentage >= MATCH_THRESHOLDS.PARTIAL) {
    verificationStatus = VERIFICATION_STATUS.PARTIAL;
    verificationNotes = `Partial match (${result.matchPercentage}%)`;
  } else {
    verificationNotes = `Name match failed (${result.matchPercentage}%)`;
    throw new Error('NAME_MISMATCH');
  }

  const updates = {
    userVerified: verificationStatus === VERIFICATION_STATUS.VERIFIED,
    verificationStatus,
    verificationNotes,
    lastVerificationAttempt: new Date(),
    matchPercentage: result.matchPercentage,
    phoneMatch: result.phoneMatch,
    userVerificationData: result.rawResponse,
  };

  if (verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    updates.verificationLevel = 'tier2';
    updates.verificationDate = new Date();

    if (!user.accountNumber) {
      try {
        const accountInfo = await createPermAccountForUser(user);
        updates.accountNumber = accountInfo.accountNumber;
        updates.accountDetails = {
          accountName: accountInfo.accountName,
          accountNumber: accountInfo.accountNumber,
          bankName: 'PalmPay',
          status: accountInfo.status,
        };
      } catch (accountError) {
        console.error('Failed to create virtual account:', accountError);
        updates.verificationNotes = `${verificationNotes} (Account creation failed)`;
      }
    }
  }

  await User.findByIdAndUpdate(user._id, updates);
};

const createPermAccountForUser = async (user) => {
  try {
    const accountReference = generateRandomReference('VIR_ACC', user.firstName);
    const nonceStr = generateNonceStr();

    const payload = {
      virtualAccountName: `${user.firstName} ${user.lastName}`,
      identityType: 'company',
      licenseNumber: process.env.BOLDDATA_LICENSE_NUMBER,
      email: user.email,
      customerName: `${user.firstName} ${user.lastName}`,
      accountReference,
      version: 'V2.0',
      requestTime: Date.now(),
      nonceStr,
    };

    const generatedSignature = sign(payload, process.env.PALMPAY_PRIVATE_KEY);

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
      throw new Error('Failed to create virtual account');
    }

    const { data } = response.data;

    const updates = {
      accountNumber: data.virtualAccountNo,
      accountDetails: {
        accountName: data.virtualAccountName,
        accountNumber: data.virtualAccountNo,
        bankName: 'PalmPay',
        status: data.status,
        reference: accountReference,
      },
      permanentAccount: data.virtualAccountNo,
    };

    await User.findByIdAndUpdate(user._id, updates);

    await logUserActivity(user._id, 'account', {
      details: 'Virtual Account Created',
      accountNumber: data.virtualAccountNo,
    });

    return {
      accountNumber: data.virtualAccountNo,
      accountName: data.virtualAccountName,
      status: data.status,
    };
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw error;
  }
};

verificationQueue.on('failed', async (job, err) => {
  console.error(`💥 Verification Job ${job.id} failed with error ${err}`);
});

verificationQueue.on('completed', (job) => {
  console.log(`✅ Verification Job ${job.id} completed`);
});

verificationQueue.on('progress', (job) => {
  console.log(`🔄 Verification Job ${job.id} is in progress`);
});

console.log('🚀 bvn worker is running...');
