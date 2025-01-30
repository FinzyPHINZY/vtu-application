import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const validateTransactionPin = async (req, res, next) => {
  try {
    const { transactionPin } = req.body;
    if (!transactionPin) {
      return res
        .status(400)
        .json({ success: false, message: 'Transaction PIN is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }

    if (!user.hasSetTransactionPin) {
      return res
        .status(403)
        .json({ success: false, message: 'Transaction PIN not set' });
    }

    // Check if PIN is locked
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.pinLockedUntil - new Date()) / 1000 / 60
      );
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingTime} minutes`,
      });
    }

    const isValidPin = await bcrypt.compare(
      transactionPin,
      user.transactionPin
    );

    if (!isValidPin) {
      user.failedPinAttempts = (user.failedPinAttempts || 0) + 1;
      user.lastPinAttempt = new Date();

      // Lock PIN after 3 failed attempts
      if (user.failedPinAttempts >= 3) {
        user.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        return res.status(429).json({
          success: false,
          message: 'PIN locked for 30 minutes due to too many failed attempts',
        });
      }

      await user.save();
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect transaction PIN' });
    }

    // Reset failed attempts on successful validation
    if (user.failedPinAttempts > 0) {
      user.failedPinAttempts = 0;
      user.lastPinAttempt = null;
      user.pinLockedUntil = null;
      await user.save();
    }

    next();
  } catch (error) {
    console.error('Transaction PIN validation failed', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const requireTransactionPin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (!user.hasSetTransactionPin) {
      return res.status(403).json({
        success: false,
        message: 'Transaction PIN not set',
      });
    }

    next();
  } catch (error) {
    console.error('Transaction PIN requirement check failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Transaction PIN requirement check failed:',
    });
  }
};
