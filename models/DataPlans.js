import mongoose from 'mongoose';

const dataPlanSchema = new mongoose.Schema({
  data_id: {
    type: Number,
    required: true,
    unique: true,
  },
  network: {
    type: String,
    required: true,
  },
  planType: {
    type: String,
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
  size: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['datastation', 'ogdams'],
    default: 'datastation',
  },
  validity: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

dataPlanSchema.index({ network: 1, isAvailable: 1 }); // Compound index
dataPlanSchema.index({ sellingPrice: 1 }); // Single field index for sorting

const DataPlan = mongoose.model('DataPlan', dataPlanSchema);

export default DataPlan;
