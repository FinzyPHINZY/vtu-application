import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // generate a four digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);

    // Save OTP in MongoDB
    await OTP.findOneAndUpdate(
      { email },
      { code: otp, createdAt: new Date(), verified: false },
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

    // demo
    res.status(200).json({
      message: 'OTP sent successfully',
      otp, // remember to remove this in production boluwatife!!!
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Fetch OTP from database
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const createdAt = otpRecord.createdAt;
    const now = new Date();

    const isExpired = now.getTime() - createdAt.getTime() > 15 * 60 * 1000;
    if (isExpired) {
      // Delete expired OTP
      await OTP.deleteOne({ email });
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (otpRecord.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // Delete OTP after successful verification
    await OTP.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

const fetchUser = async (req, res) => {
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

const fetchUsers = async (req, res) => {
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

const signUp = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 3 characters long',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash,
    });

    const savedUser = await user.save();

    return res.status(201).json({
      success: true,
      message: 'Signed up successfully',
      data: savedUser,
    });
  } catch (error) {
    console.error('Error during Signup: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server error',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - Incorrect Password',
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

const updateUserRole = async (req, res) => {
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

export {
  signUp,
  login,
  fetchUser,
  fetchUsers,
  updateUserRole,
  sendOTP,
  verifyOTP,
};
