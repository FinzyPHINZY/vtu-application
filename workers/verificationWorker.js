import axios from 'axios';
import { Worker } from 'bullmq';
import { config } from 'dotenv';

import User from '../models/User.js';
import { sign } from '../palmpay.js';
import verificationQueue, { connection } from '../queues/verificationQueue.js';
import { generateNonceStr } from '../services/palmpay.js';

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
    // console.log(job.name);
    // console.log(job.data);
    userEnquiry(job);
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
    throw new Error(`Provider error: ${respMsg}`);
  }

  return {
    matchPercentage: data.namesMatchPercentage,
    matchResult: data.nameMatchRlt,
    phoneMatch: data.phoneNumberMatchRlt,
    requestId: response.data.requestId,
    rawResponse: response.data,
  };
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
    throw new Error(verificationNotes);
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

  // Only update these fields if verification was successful
  if (verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    updates.verificationLevel = 'tier2';
    updates.verificationDate = new Date();
  }

  await User.findByIdAndUpdate(user._id, updates);

  // Trigger additional processes for verified users
  if (verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    // await triggerVirtualAccountCreation(user);
    // await sendVerificationNotification(user);
  }
};

verificationQueue.on('failed', (job, err) => {
  console.error(`💥 Verification Job ${job.id} failed with error ${err}`);
});

verificationQueue.on('completed', (job) => {
  console.log(`✅ Verification Job ${job.id} completed`);
});

verificationQueue.on('progress', (job) => {
  console.log(`🔄 Verification Job ${job.id} is in progress`);
});

console.log('🚀 bvn worker is running...');
