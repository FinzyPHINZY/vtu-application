import OTP from '../models/OTP.js';
import bcrypt from 'bcrypt';
import { isValidEmail } from '../utils/helpers.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import TokenCache from '../services/tokenCache.js';
import sendEmail from '../services/emailService.js';

const tokenCache = new TokenCache();

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered' });
    }

    // generate a four digit otp
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

    if (!existingUser) {
      await User.create({ email });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error - Failed to send OTP',
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Request - Not Found' });
    }

    const isOtpCorrect = await bcrypt.compare(otp, otpRecord.codeHash);

    if (!isOtpCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    otpRecord.verified = true;
    user.isVerified = true;
    await user.save();
    await otpRecord.save();

    await OTP.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error - Failed to verify OTP',
      error: error.message,
    });
  }
};

export const completeSignUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 3 characters long',
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    existingUser.name = name;
    existingUser.phoneNumber = phoneNumber;
    existingUser.password = await bcrypt.hash(password, 10);

    const savedUser = await existingUser.save();

    const userForToken = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phoneNumber: savedUser.phoneNumber,
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(201).json({
      success: true,
      message: 'Signed up successfully',
      data: savedUser,
      token,
    });
  } catch (error) {
    console.error('Error during Signup: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid Credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();
      await user.save();
      return res
        .status(401)
        .json({ success: false, message: 'Invalid Credentials' });
    }

    const userForToken = {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: user,
      token,
    });
  } catch (error) {
    console.error('Error during login', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server error',
    });
  }
};

export const getToken = async (req, res, next) => {
  try {
    const cachedToken = tokenCache.get('access_token');
    console.log('cachedtoken ====>>>', cachedToken);
    if (cachedToken) {
      return res.json(cachedToken);
    }

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/oauth2/token',
      req.body
    );

    const tokenData = response.data;
    console.log('tokenData', tokenData);
    tokenCache.set('access_token', tokenData, tokenData.expires_in);

    console.log('New access token generated');
    res.json(tokenData);
  } catch (error) {
    console.error('Token generation failed:', error);

    if (error.response) {
      return res
        .status(400)
        .json({ success: false, message: error.response.data.message });
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Internal server error' });
    }
  }
};
