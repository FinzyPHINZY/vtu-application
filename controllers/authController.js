import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import { isValidEmail } from '../utils/helpers.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { generateOtpEmailTemplate } from '../utils/email.js';
import sendEmail from '../services/emailService.js';
import { getAuthorizationToken } from '../services/safeHavenAuth.js';
import ApiError from '../utils/error.js';
import { logUserActivity } from '../utils/userActivity.js';

export const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log('log1');

    if (!email || !isValidEmail(email)) {
      throw new ApiError(401, false, 'Invalid email address');
    }

    const existingUser = await User.findOne({ email });
    // if (existingUser?.isVerified) {
    //   throw new ApiError(409, false, 'Email already registered');
    // }

    console.log('log2');

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

    console.log('log3');

    const html = generateOtpEmailTemplate(otp, email);

    console.log('log4');

    // Send OTP email
    await sendEmail(email, 'Authentication OTP', html);

    console.log('log50');

    if (!existingUser) {
      await User.create({ email });
    }

    console.log('log100');

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.log('OTP request failed', error);
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
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

    if (!user.firstName) {
      otpRecord.verified = true;
      user.isVerified = true;

      await user.save();
      await otpRecord.save();

      await OTP.deleteOne({ email });

      await logUserActivity(user._id, 'signup', { ip: req.ip });

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        email,
      });
    } else {
      if (user.isGoogleUser) {
        throw new ApiError(400, false, 'Please sign in with Google');
      }

      if (!user.isVerified) {
        throw new ApiError(400, false, 'User is not verified');
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

      user.safeHavenAccessToken = {
        access_token,
        ibs_client_id,
      };
      await user.save();

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

      await logUserActivity(user._id, 'login', { ip: req.ip });

      await OTP.deleteOne({ email });

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
          imageUrl: user.originalImageUrl || null,
          thumbnailUrl: user.thumbnailUrl || null,
        },
        token,
        expires_in,
      });
    }
  } catch (error) {
    console.error('OTP verification failed', error);
    next(error);
  }
};

export const completeSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

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

    existingUser.accountBalance = 0;
    existingUser.accountDetails = {
      bankName: '',
      accountName: `${firstName} ${lastName}`,
      accountType: 'Current',
      accountBalance: '0',
      status: 'Pending',
    };

    await existingUser.save();

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

    existingUser.safeHavenAccessToken = {
      access_token,
      ibs_client_id,
    };

    await existingUser.save();

    const userForToken = {
      id: existingUser._id,
      safeHavenAccessToken: {
        access_token,
        expires_in,
        ibs_client_id,
      },
    };

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    await logUserActivity(existingUser._id, 'login', { ip: req.ip });

    return res.status(201).json({
      success: true,
      message: 'Signed up successfully',
      data: {
        _id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        accountBalance: existingUser.accountBalance,
        hasSetTransactionPin: existingUser.hasSetTransactionPin,
        isVerified: existingUser.isVerified,
        status: existingUser.status,
        isGoogleUser: true,
        accountDetails: existingUser.accountDetails,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phoneNumber: existingUser.phoneNumber,
        imageUrl: existingUser.originalImageUrl || null,
        thumbnailUrl: existingUser.thumbnailUrl || null,
      },
      token,
      expires_in,
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

    if (user.isGoogleUser) {
      throw new ApiError(400, false, 'Please sign in with Google.');
    }

    if (!user.password) {
      throw new ApiError(401, false, 'Invalid Credentials');
    }

    if (!user.isVerified) {
      throw new ApiError(401, false, 'User is not verified');
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

    user.safeHavenAccessToken = {
      access_token,
      ibs_client_id,
    };
    await user.save();

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

    await logUserActivity(user._id, 'login', { ip: req.ip });

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
        imageUrl: user.originalImageUrl || null,
        thumbnailUrl: user.thumbnailUrl || null,
      },
      token,
      expires_in,
    });
  } catch (error) {
    next(error);
    console.error(
      'Error during login',
      error?.response || error?.message || error
    );
  }
};

// google login

export const googleLogin = async (req, res) => {
  try {
    const { email, googleId, firstName, lastName } = req.user;

    // Find or create user

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;

        user.isGoogleUser = true;

        user.isVerified = true;

        if (!user.firstName) user.firstName = firstName || 'Unknown';

        if (!user.lastName) user.lastName = lastName || 'Unknown';

        await user.save();
      } else if (user.googleId !== googleId) {
        return res.status(400).json({
          success: false,

          message: 'Email already associated with different Google account',
        });
      }
    } else {
      // Create new user with Google credentials

      user = await User.create({
        email,
        googleId,
        isVerified: true,
        isGoogleUser: true,
        phoneNumber: null,
        firstName,
        lastName,
        accountBalance: 0,
        accountDetails: {
          bankName: '',
          accountName: `${firstName || ''} ${lastName || ''}`,
          accountType: 'Current',
          accountBalance: '0',
          status: 'Pending',
        },
      });
    }

    // if (user && user.isGoogleUser !== true) {

    //   throw new ApiError(400, false, 'Please login with EMAIL and PASSWORD');

    // }

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

    user.safeHavenAccessToken = {
      access_token,
      ibs_client_id,
    };

    await user.save();

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
        imageUrl: user.originalImageUrl || null,
        thumbnailUrl: user.thumbnailUrl || null,
      },

      token,

      expires_in,
    });
  } catch (error) {
    console.error('Google login failed:', error);

    res.status(500).json({ success: false, message: 'Google login failed' });
  }
};
