import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['electricity', 'airtime', 'data', 'cable', 'other'],
      default: 'electricity',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// settingSchema.index({ key: 1 }, { unique: true });

settingSchema.statics.getSetting = async function (key) {
  const setting = await this.findOne({ key, isActive: true }).lean();
  return setting?.value;
};

settingSchema.statics.updateSetting = async function (key, value, userId) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedBy: userId },
    { upsert: true, new: true }
  );
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
