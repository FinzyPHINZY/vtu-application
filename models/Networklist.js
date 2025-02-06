import mongoose from 'mongoose';

const networkListSchema = new mongoose.Schema(
  {
    network_id: {
      type: Number,
      unique: true,
      required: true,
    },
    networkname: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const NetworkList = mongoose.model('NetworkList', networkListSchema);

export default NetworkList;
