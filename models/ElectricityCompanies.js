import mongoose from 'mongoose';

const electricityCompaniesSchema = new mongoose.Schema(
  {
    disco_id: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ElectricityCompany = mongoose.model(
  'ElectricityCompany',
  electricityCompaniesSchema
);

export default ElectricityCompany;
