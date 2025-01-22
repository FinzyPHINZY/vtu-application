import User from '../models/User.js';

export const createSubAccount = async (req, res) => {
  try {
    const {
      phoneNumber,
      emailAddress,
      externalReference,
      identityType,
      identityNumber,
      identityId,
      otp,
      autoSweep = false,
      autoSweepDetails = { schedule: 'Instant' },
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.accountNumber) {
      return res
        .status(409)
        .json({ success: false, message: 'User already has a sub-account' });
    }

    const payload = {
      phoneNumber,
      emailAddress,
      externalReference,
      identityType,
      identityNumber,
      identityId,
      otp,
      callbackUrl: process.env.FRONTEND_BASE_URL,
      autoSweep,
      autoSweepDetails,
    };

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/accounts/v2/subaccount`,
      payload,
      {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
          ClientID: process.env.SAFE_HAVEN_CLIENT_IBS_ID,
        },
      }
    );

    const { data } = response.data;

    user.accountNumber = data.accountNumber;
    user.accountDetails = {
      bankName: data.bankName,
      accountName: data.accountName,
      accountType: data.accountType,
      status: data.status,
    };

    await user.save();

    console.log(`Sub-account created successfully for user: ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Sub-account created successfully',
      data: {
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        accountType: data.accountType,
        currency: data.currency,
        status: data.status,
        createdAt: data.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getAccountDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/accounts/${id}`,
      {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
          ClientID: process.env.SAFE_HAVEN_CLIENT_IBS_ID,
        },
        timeout: 30000,
      }
    );

    const { data } = response.data;

    console.log(`Account details retrieved successfully for account ID: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Account details retrieved successfully',
      data,
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};
