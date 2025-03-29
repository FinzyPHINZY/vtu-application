import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    serviceType: {
      type: String,
      enum: [
        'airtime',
        'data',
        'bank_transfer',
        'deposit',
        'withdrawal',
        'electricity',
        'tvSubscription',
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ['debit', 'credit'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: function () {
        return this.amount;
      },
      min: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    metadata: {
      type: Object,
    },
    virtualAccountId: {
      type: String,
      required: (doc) => {
        return doc?.serviceType === 'deposit';
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    failureReason: {
      type: String,
      default: null,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    lastVerifiedAt: {
      type: Date,
    },
    processingTime: {
      type: Number,
    },
    statusHistory: [
      {
        status: String,
        timestamp: Date,
        reason: String,
      },
    ],
  },
  { timestamps: true, _id: false } // to prrevent MongoDB from creating a separate ObjectId for each transaction
);

transactionSchema.index({ serviceType: 1, createdAt: 1 });
transactionSchema.index({ 'metadata.network': 1, createdAt: 1 });
transactionSchema.index({ profit: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
