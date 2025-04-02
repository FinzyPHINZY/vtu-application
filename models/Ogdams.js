import mongoose from 'mongoose';

const ogDamsSchema = new mongoose.Schema({
  networkId: {
    type: Number,
    default: 2,
  },
  planId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  validity: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    default: 'NGN',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
    default: function () {
      return this.amount;
    },
  },
  type: {
    type: String,
    required: true,
    default: 'AWOOF',
  },
  source: {
    type: String,
    enum: ['ogdams', 'datastation'],
    default: 'ogdams',
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const ogDams = mongoose.model('ogDams', ogDamsSchema);

export default ogDams;
