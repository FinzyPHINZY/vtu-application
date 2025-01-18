import OTP from '../models/OTP.js';
import bcrypt from 'bcrypt';
import { isValidEmail } from '../utils/helpers.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import TokenCache from '../services/tokenCache.js';

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
    // todo: integrate an sms service here
    // const message = await client.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: '+1234567890',
    //   messagingServiceSid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    //   to: phoneNumber,
    // });
    // await smsService.send(phoneNumber, `Your OTP is: ${otp}`);

    console.log('OTP generated and saved:', otp);

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

    otpRecord.verified = true;
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
    const { name, email, phoneNumber } = req.body;

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 3 characters long',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = new User({
      name,
      email,
      phoneNumber,
    });

    const savedUser = await user.save();

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
  // take in an email,
  // send otp
  // create token
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

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

    otpRecord.verified = true;
    await otpRecord.save();

    await OTP.deleteOne({ email });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
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
