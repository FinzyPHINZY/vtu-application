import OTP from '../models/OTP.js';
import bcrypt from 'bcrypt';
import { isValidEmail } from '../utils/helpers.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { generateOtpEmailTemplate } from '../utils/email.js';
import sendEmail from '../services/emailService.js';
import { getAuthorizationToken } from '../services/safeHavenAuth.js';
import ApiError from '../utils/error.js';
import { errorHandler } from '../utils/middleware.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new ApiError(401, false, 'Invalid email address');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      throw new ApiError(409, false, 'Email already registered');
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

    const html = generateOtpEmailTemplate(otp, email);
    // Send OTP email
    await sendEmail(email, 'Registration OTP', html);

    if (!existingUser) {
      await User.create({ email });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.log('OTP request failed', error);
    next(error);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      throw new ApiError(401, false, 'Invalid Request - Not Found');
    }

    const isOtpCorrect = await bcrypt.compare(otp, otpRecord.codeHash);

    if (!isOtpCorrect) {
      throw new ApiError(400, false, 'Invalid OTP');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, false, 'User not found');
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
    console.error('OTP verification failed', error);
    next(error);
  }
};

export const completeSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName.length || !lastName.length) {
      throw new ApiError(
        400,
        false,
        'First name and Last name must be provided'
      );
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new ApiError(404, false, 'User not found');
    }

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.phoneNumber = phoneNumber;
    existingUser.password = await bcrypt.hash(password, 10);

    existingUser.accountBalance = 0;
    existingUser.accountDetails = {
      bankName: '',
      accountName: `${firstName} ${lastName}`,
      accountType: 'Current',
      accountBalance: '0',
      status: 'Pending',
    };

    await existingUser.save();

    return res.status(201).json({
      success: true,
      message: 'Signed up successfully',
    });
  } catch (error) {
    console.error('Error during Signup: ', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, false, 'User not found');
    }

    if (!user || !user.isVerified) {
      throw new ApiError(401, false, 'Invalid Credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();
      await user.save();

      throw new ApiError(401, false, 'Invalid Credentials');
    }

    const refreshToken = await getAuthorizationToken();

    const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
    const CLIENT_ASSERTION = process.env.SAFE_HAVEN_CLIENT_ASSERTION;

    const body = {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_assertion: CLIENT_ASSERTION,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      refresh_token: refreshToken,
    };

    console.log('generating safe haven token');
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/oauth2/token`,
      body
    );

    if (response.data.error) {
      throw new ApiError(403, false, response.data.error);
    }

    console.log('successfully generated safe haven token');

    const { access_token, expires_in, ibs_client_id } = response.data;

    const userForToken = {
      id: user._id,
      safeHavenAccessToken: {
        access_token,
        expires_in,
        ibs_client_id,
      },
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        accountBalance: user.accountBalance,
        hasSetTransactionPin: user.hasSetTransactionPin,
        isVerified: user.isVerified,
        status: user.status,
        isGoogleUser: true,
        accountDetails: user.accountDetails,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
      token,
      expires_in,
    });
  } catch (error) {
    next(error);
    console.error('Error during login', error.response);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, googleId } = req.user;

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId }, { email, authProvider: 'google' }],
    });

    if (!user) {
      // Create new user with Google credentials
      user = await User.create({
        email,
        googleId,
        isVerified: true,
        isGoogleUser: true,
        phoneNumber: null,
        firstName: '',
        lastName: '',
        accountBalance: 0,
        accountDetails: {
          bankName: '',
          accountName: '',
          accountType: 'Current',
          accountBalance: '0',
          status: 'Pending',
        },
      });

      console.log('this is user', user);
    }

    if (user && user.isGoogleUser !== true) {
      throw new ApiError(400, false, 'Please login with EMAIL and PASSWORD');
    }

    // Get Safe Haven token

    const refreshToken = await getAuthorizationToken();

    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.SAFE_HAVEN_CLIENT_ID,
      client_assertion: process.env.SAFE_HAVEN_CLIENT_ASSERTION,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      refresh_token: refreshToken,
    };

    let safeHavenResponse;
    try {
      safeHavenResponse = await axios.post(
        `${process.env.SAFE_HAVEN_API_BASE_URL}/oauth2/token`,
        body
      );
    } catch (error) {
      console.error(
        'Failed to get Safe Haven token:',
        error.response?.data || error.message
      );
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate with Safe Haven',
      });
    }

    const { access_token, expires_in, ibs_client_id } = safeHavenResponse.data;

    // Remove sensitive data from user object

    console.log(`User logged in with Google successfully: ${email}`);

    // Create JWT token
    const userForToken = {
      id: user._id,
      safeHavenAccessToken: {
        access_token,
        expires_in,
        ibs_client_id,
      },
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        accountBalance: user.accountBalance,
        hasSetTransactionPin: user.hasSetTransactionPin,
        isVerified: user.isVerified,
        status: user.status,
        isGoogleUser: true,
        accountDetails: user.accountDetails,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
      token,
      expires_in,
    });
  } catch (error) {
    console.error('Google login failed:', error);
    res.status(500).json({ success: false, message: 'Google login failed' });
  }
};
