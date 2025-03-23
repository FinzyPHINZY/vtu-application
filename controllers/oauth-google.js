import { getTokenResponse } from '../utils/getTokenResponse.js';
import User from '../models/User.js';
import UserToken from '../models/UserToken.js';
import jwt from 'jsonwebtoken';
import { logUserActivity } from '../utils/userActivity.js';

export const appLogin = async (req, res, next) => {
  const { id, displayName, email } = req.body;
  try {
    let user = await User.findOne({ email: email });

    if (user) {
      // If the user exists, update their Google ID and profile information
      user.googleId = id;
      user.username = displayName;
      await user.save();
    } else {
      // If the user doesn't exist, create a new user
      user = new User({
        googleId: id,
        username: displayName,
        email: email,
        profilePicture: photoUrl,
      });
      await user.save();
    }
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    const userToken = await UserToken.findOne({ user: user._id });
    if (userToken) await UserToken.findOneAndDelete({ user: user._id });

    await new UserToken({ user: user._id, token: refreshToken }).save();

    getTokenResponse(user, 200, res, false, refreshToken);
  } catch (error) {
    console.error('Error handling user after Google authentication', error);
    res.status(500).send('Internal Server Error');
  }
};

export const googleCallback = async (req, res, next) => {
  const { id, displayName, emails, name } = req.user;
  try {
    let user = await User.findOne({ email: emails[0].value });

    if (user) {
      // If the user exists, update their Google ID and profile information
      user.googleId = id;
      user.firstName = name.givenName;
      user.lastName = name.familyName;
      user.googleEmail = emails[0].value;
      user.isVerified = true;
      user.isGoogleUser = true;
      user.accountDetails = {
        bankName: '',
        accountId: '',
        accountName: '',
        accountType: '',
        status: '',
      };

      await user.save();
    } else {
      // If the user doesn't exist, create a new user
      user = new User({
        googleId: id,
        username: displayName,
        firstName: name.givenName,
        lastName: name.familyName,
        googleEmail: emails[0].value,
        email: emails[0].value,
        isVerified: true,
        isGoogleUser: true,
        accountDetails: {
          bankName: '',
          accountId: '',
          accountName: '',
          accountType: '',
          status: '',
        },
      });
      await user.save();
    }

    await logUserActivity(user._id, 'login', { ip: req.ip });

    // getTokenResponse(user, 200, res, true);

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role || 'user', // Default role if not set
        accountBalance: user.accountBalance || 0,
        hasSetTransactionPin: user.hasSetTransactionPin || false,
        isVerified: user.isVerified,
        status: user.status || 'active',
        isGoogleUser: true,
        accountDetails: user.accountDetails,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
      },
      token,
      expires_in: 86400, // 1 day in seconds
    });
  } catch (error) {
    console.error('Error handling user after Google authentication', error);
    res.status(500).send('Internal Server Error');
  }
};
