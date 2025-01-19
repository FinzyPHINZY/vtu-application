import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
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
      },
    ],
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
