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
  },
  { timestamps: true }
);

const CablePlan = mongoose.model('CablePlan', cablePlanSchema);

export default CablePlan;
