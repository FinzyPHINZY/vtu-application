import User from '../models/User.js';
import { NetworkProviders } from '../utils/constants.js';
import { getSafeHavenAccessToken } from '../helpers/safehavenHelpers.js';

export const purchaseAirtime = async (req, res) => {
  const { amount, phoneNumber, network } = req.body;

  if (amount < 50 || amount > 100000) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid airtime purchase amount. Please enter an amount between 50 and 100,000.',
    });
  }

  if (
    !phoneNumber ||
    !phoneNumber.startsWith('+234') ||
    !phoneNumber.length === 14
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid phone number. Please enter a valid phone number starting with +234.',
    });
  }

  if (!NetworkProviders.includes(network)) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid network provider. Please choose from MTN, GLO, AIRTEL, or 9MOBILE.',
    });
  }

  const user = await User.findById(req.user.id);

  if (user.accountBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient account balance',
    });
  }

  try {
    // Send request to SAFEHAVENMFB API
    const { access_token, token_type, ibs_client_id } =
      await getSafeHavenAccessToken();

    const response = await axios.post(
      `${process.env.SAFEHAVEN_MFB_API_URL}/vas/purchase`,
      { phoneNumber, amount, phoneNumber },
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const transaction = response.data;

    if (transaction.statusCode === 200) {
      // update user account balance
      // save transaction in db
      // await updateUserWalletBalance(req.user.id, -amount); // Deduct wallet balance
      // await logTransaction(req.user.id, transaction); // Save transaction in DB
      return res
        .status(200)
        .json({ message: 'Airtime purchase successful', transaction });
    } else {
      return res.status(400).json({
        message: 'Airtime purchase failed',
        error: transaction.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Airtime purchase failed',
      error: error.response?.data || error.message,
    });
  }
};
