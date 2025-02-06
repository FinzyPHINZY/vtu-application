import mongoose from 'mongoose';

const cableListSchema = new mongoose.Schema(
  {
    cable_id: {
      type: Number,
      unique: true,
      required: true,
    },
    cablename: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const CableList = mongoose.model('CableList', cableListSchema);

export default CableList;
