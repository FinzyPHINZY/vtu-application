import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
    },
    expires_in: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 2100, // 35 minutes in seconds
    },
  },
  {
    capped: {
      size: 100000,
      max: 1,
    }, // Ensure only one document exists
  }
);

const Token = mongoose.model('Token', tokenSchema);

export default Token;
