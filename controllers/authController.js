import OTP from '../models/OTP.js';
import bcrypt from 'bcrypt';
import { isValidEmail } from '../utils/helpers.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName.length || !lastName.length) {
      return res.status(400).json({
        success: false,
        message: 'First name and Last name must be provided',
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
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

    //
    const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
    const CLIENT_ASSERTION = process.env.SAFE_HAVEN_CLIENT_ASSERTION;

    const body = {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_assertion: CLIENT_ASSERTION,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    };

    console.log('generating safehaven token');
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/oauth2/token`,
      body
    );

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
        transactions: user.transactions,
        hasSetTransactionPin: user.hasSetTransactionPin,
        isVerified: user.isVerified,
        status: user.status,
        isGoogleUser: false,
        accountDetails: user.accountDetails,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error('Error during login', error.response);
    return res.status(500).json({
      success: false,
      message: 'Internal Server error',
    });
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Google ID token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, email_verified } = ticket.getPayload();

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is not verified',
      });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId }, { email, authProvider: 'google' }],
    });

    if (!user) {
      // Create new user with Google credentials
      user = await User.create({
        email,
        googleId,
        googleEmail: email,
        authProvider: 'google',
        isVerified: true, // Google accounts are pre-verified
        isGoogleUser: true,
      });
    } else {
      // Update existing user's Google credentials if needed
      user.googleId = googleId;
      user.googleEmail = email;
      user.authProvider = 'google';
      user.isVerified = true;
      user.isGoogleUser = true;

      await user.save();
    }

    // Get SafeHaven token
    const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
    const CLIENT_ASSERTION = process.env.SAFE_HAVEN_CLIENT_ASSERTION;

    const body = {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_assertion: CLIENT_ASSERTION,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    };

    console.log('generating safehaven token');
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/oauth2/token`,
      body
    );

    console.log(
      'successfully generated safe haven token',
      response.data.ibs_client_id
    );

    const { access_token, expires_in, ibs_client_id } = response.data;

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.failedLoginAttempts;
    delete userResponse.lastLoginAttempt;

    logger.info(`User logged in with Google successfully: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        user: userResponse,
        safeHavenAccessToken: {
          access_token,
          expires_in,
          ibs_client_id,
        },
      },
    });
  } catch (error) {
    console.error('Google login failed:', error);

    if (error.message.includes('Token used too late')) {
      return res
        .status(401)
        .json({ success: false, message: 'Google token expired' });
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Google login failed' });
    }
  }
};
