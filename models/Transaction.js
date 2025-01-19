import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: [
        'airtime',
        'data',
        'transfer',
        'deposit',
        'withdrawal',
        'electricity',
        'tvSubscription',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
  { _id: false } // to prrevent MongoDB from creating a separate ObjectId for each transaction
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
