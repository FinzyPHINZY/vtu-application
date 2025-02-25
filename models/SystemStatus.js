import mongoose from 'mongoose';

const systemStatusSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'shutdown',
    },
    isActive: {
      type: Boolean,
      default: false, // False === system is shut down, true === system is running
    },
    reason: {
      type: String,
      default: null,
    },
    shutdownTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    estimatedRestoreTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);

export default SystemStatus;
