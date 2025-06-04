import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/User.js';

config();

console.log('running');

export const migrateKYCStatus = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await User.updateMany(
    {
      verificationStatus: 'verified',
      isKYCVerified: { $ne: true },
    },
    { $set: { isKYCVerified: true } }
  );

  console.log(`Updated ${result.modifiedCount} users with KYC verified status`);
  process.exit(0);
};
