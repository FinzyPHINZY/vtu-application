import axios from 'axios';
import { Worker } from 'bullmq';
import { config } from 'dotenv';
import md5 from 'md5';

import { rsaVerify, sign, sortParams } from '../palmpay.js';
import disableVAQueue, { connection } from '../queues/disableVAQueue.js';
import { generateNonceStr } from '../services/palmpay.js';

config();

console.log('🚀 disableVA worker is running...');

const mainWorkerOptions = {
  connection,
  concurrency: 5,
  removeOnFail: { count: 0 },
};

export const disableVAWorker = new Worker(
  'disableVAQueue',
  async (job) => {
    console.log(job.name);
    console.log(job.data);
    disableVirtualAccount(job);
  },
  mainWorkerOptions
);

disableVAWorker.on('error', (err) => {
  // log the error
  console.error(`Error processing job: ${err}`);
});

const disableVirtualAccount = async (job) => {
  const { vaId, transactionId } = job.data;

  if (!vaId || !transactionId) {
    throw new Error('Invalid job data - missing vaId or transactionId');
  }

  console.log(
    `⏳ Disabling virtual account ${vaId} for transaction ${transactionId}`
  );

  try {
    const nonceStr = generateNonceStr();

    const payload = {
      requestTime: Date.now(),
      version: 'V2.0',
      virtualAccountNo: vaId,
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
          'Content-Type': 'application/json',
          CountryCode: 'NG',
          Signature: generatedSignature,
        },
      }
    );

    const { respMsg } = response.data;

    if (respMsg !== 'success') {
      console.error(`❌ Error disabling VA ${vaId}:`, respMsg || response.data);
      return response.data;
    }

    console.log(`✅ VA ${vaId} disabled successfully`);

    return response.data;
  } catch (error) {
    console.error(`❌ Error disabling VA ${vaId}:`, error.message);
    throw error;
  }
};

disableVAQueue.on('failed', (job, err) => {
  console.error(`💥 Job failed for VA ${job.data.vaId}: ${err.message}`);
});

disableVAQueue.on('completed', (job, result) => {
  console.log(`Job completed for VA ${job.data.vaId}`);
});

disableVAQueue.on('progress', (job, progress) => {
  console.log(`Job progress: ${progress}%`);
});

console.log('🚀 disableVA worker is running...');
