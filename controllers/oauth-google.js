import { getTokenResponse } from '../utils/getTokenResponse.js';
import User from '../models/User.js';
import UserToken from '../models/UserToken.js';
import jwt from 'jsonwebtoken';

export const appLogin = async (req, res, next) => {
  const { id, displayName, email } = req.body;
  console.log('Request received', req.body);
  try {
    let user = await User.findOne({ email: email });
    console.log('user from DB ', user);

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
  const { id, displayName, emails } = req.user;
  try {
    let user = await User.findOne({ email: emails[0].value });

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
        email: emails[0].value,
      });
      await user.save();
    }

    getTokenResponse(user, 200, res, true);
  } catch (error) {
    console.error('Error handling user after Google authentication', error);
    res.status(500).send('Internal Server Error');
  }
};
