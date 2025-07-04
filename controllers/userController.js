import bcrypt from 'bcryptjs';
import { matchedData } from 'express-validator';

import cloudinary from '../Config/cloudinary.js';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import sendEmail from '../services/emailService.js';
import { generatePasswordResetEmailTemplate } from '../utils/email.js';
import ApiError from '../utils/error.js';
import { logUserActivity } from '../utils/userActivity.js';

export const fetchUser = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).populate('transactions').lean();

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

export const updateUser = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, false, 'Unauthorized - User not found');
    }

    const safeData = matchedData(req, { locations: ['body'] });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, safeData, {
      new: true,
    });

    if (!updatedUser) {
      throw new ApiError(500, false, 'Failed to update user');
    }

    res.status(200).json({ success: true, data: safeData });
  } catch (error) {
    console.log('Failed to update user', error.message || error);
    next(error);
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

    await logUserActivity(user._id, 'profile_update', { field: 'role' });

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

    const emailHtml = generatePasswordResetEmailTemplate(otp, user.firstName);

    // Send OTP email
    await sendEmail(email, 'Reset Password OTP', emailHtml);
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
    const { email, password, otp } = req.body;

    if (!otp) {
      throw new ApiError(404, false, 'Please provide OTP');
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      throw new ApiError(401, false, 'Invalid Request - Not Found');
    }

    const isOtpCorrect = await bcrypt.compare(otp, otpRecord.codeHash);

    if (!isOtpCorrect) {
      throw new ApiError(400, false, 'Invalid OTP');
    }

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

    await logUserActivity(user._id, 'profile_update', { field: 'password' });

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
    const { transactionPin } = req.body;

    if (!/^\d{4}$/.test(transactionPin)) {
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

    const encryptedPin = await bcrypt.hash(transactionPin, 10);

    user.transactionPin = encryptedPin;
    user.hasSetTransactionPin = true;
    user.failedPinAttempts = 0;
    user.lastPinAttempt = null;
    user.pinLockedUntil = null;

    await user.save();

    console.log(`Transaction PIN set successfully for user: ${req.user.id}`);

    await logUserActivity(user._id, 'profile_update', {
      field: 'transactionPin',
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction PIN set successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        accountBalance: user.accountBalance,
        hasSetTransactionPin: user.hasSetTransactionPin,
        isVerified: user.isVerified,
        status: user.status,
        isGoogleUser: user.isGoogleUser,
        accountDetails: user.accountDetails,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Failed to set transaction pin', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, false, 'Please upload an image file');
    }

    const bufferToDataURI = (mimetype, buffer) => {
      const base64 = buffer.toString('base64');
      return `data:${mimetype};base64,${base64}`;
    };

    const fileDataUri = bufferToDataURI(req.file.mimetype, req.file.buffer);

    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: 'profile-pictures',
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
      },
      {
        originalImageUrl: result.secure_url,
        thumbnailUrl: result.secure_url,
        uploadTimestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        originalImageUrl: user.originalImageUrl,
        thumbnailUrl: user.thumbnailUrl,
      },
    });
  } catch (error) {
    if (error.message === 'File too large') {
      console.log('Failed to upload image', error);
      throw new ApiError(
        400,
        false,
        'File size too large. Maximum size is 5MB'
      );
    }
    next(error);
  }
};
