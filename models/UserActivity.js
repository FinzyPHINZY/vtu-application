import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  activityType: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
    index: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
});

userActivitySchema.index({ userId: 1, timestamp: 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
