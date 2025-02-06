import mongoose from 'mongoose';

const dataPlanSchema = new mongoose.Schema({
  data_id: { type: Number, required: true, unique: true },
  network: { type: String, required: true },
  planType: { type: String, required: true },
  amount: { type: Number, required: true },
  size: { type: String, required: true },
  validity: { type: String, required: true },
});

const DataPlan = mongoose.model('DataPlan', dataPlanSchema);

export default DataPlan;
