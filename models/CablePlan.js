import mongoose from 'mongoose';

const cablePlanSchema = new mongoose.Schema(
  {
    cablePlanID: {
      type: Number,
      required: true,
      unique: true,
    },
    cablename: {
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
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

cablePlanSchema.index({ cablename: 1, isAvailable: 1 }); // Compound index

const CablePlan = mongoose.model('CablePlan', cablePlanSchema);

export default CablePlan;
