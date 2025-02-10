import mongoose from 'mongoose';

const accountDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountId: String,
  accountName: String,
  accountType: String,
  status: String,
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      trim: true,
      lowercase: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    googleEmail: {
      type: String,
      sparse: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      // unique: true,
      // sparse: true,
      required: false,
      match: /^\+?\d{1,15}$/,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    accountBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    accountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    accountDetails: accountDetailsSchema,
    transactionPinHash: {
      type: String,
      required: false,
      match: /^\d{4}$/,
      minlength: 4,
      maxlength: 4,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: [],
      },
    ],
    transactionPin: {
      type: String,
      required: false,
    },
    hasSetTransactionPin: {
      type: Boolean,
      default: false,
    },
    failedPinAttempts: {
      type: Number,
      default: 0,
    },
    lastPinAttempt: {
      type: Date,
    },
    pinLockedUntil: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lastLoginAttempt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
