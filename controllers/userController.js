import OTP from '../models/OTP.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const fetchUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched user successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server error' });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      message: 'Fetched all users successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'user'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified.',
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the user role.',
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Save OTP in MongoDB
    await OTP.findOneAndUpdate(
      { email },
      { codeHash: hashedOtp, createdAt: new Date(), verified: false },
      { upsert: true }
    );

    // Send OTP email
    // await sendEmail(email, 'Registration OTP', `Your OTP is: ${otp}`);
    console.log(`Password reset requested for user: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully',
    });
  } catch (error) {
    console.error('Failed to send OTP', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const newPassword = await bcrypt.hash(password, 10);
    user.password = newPassword;
    await user.save();

    console.log(`Password reset completed for user: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

export const setTransactionPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!/^\d{4}$/.test(pin)) {
      return res
        .status(400)
        .json({ success: false, message: 'PIN must be exactly 4 digits' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const encryptedPin = await bcrypt.hash(pin, 10);

    user.transactionPin = encryptedPin;
    user.hasSetTransactionPin = true;
    user.failedPinAttempts = 0;
    user.lastPinAttempt = null;
    user.pinLockedUntil = null;

    await user.save();

    console.log(`Transaction PIN set successfully for user: ${req.user.id}`);

    return res
      .status(200)
      .json({ success: true, message: 'Transction PIN set successfully' });
  } catch (error) {
    console.error('Failed to set transaction pin', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};
