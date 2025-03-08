import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserToken = mongoose.model('UserToken', UserTokenSchema);

export default UserToken;
