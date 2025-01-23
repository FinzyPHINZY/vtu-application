import {
  isValidPhoneNumber,
  processTransaction,
  validateBalance,
} from '../utils/transaction.js';

export const purchaseAirtime = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, amount, phoneNumber, debitAccountNumber } =
      req.body;

    if (!isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid phone number format' });
    }

    const user = await validateBalance(req.user.id, amount);

    const transactionDetails = {
      reference: `AIR${Date.now()}`,
      serviceType: 'airtime',
      metadata: {
        serviceCategoryId,
        phoneNumber,
        debitAccountNumber,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/vas/pay/airtime',
      {
        serviceCategoryId,
        amount,
        channel: 'WEB',
        debitAccountNumber,
        phoneNumber,
        statusUrl: `${process.env.API_BASE_URL}/webhook/transaction-status`,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    // Update transaction status
    transaction.status = 'success';
    transaction.providerResponse = response.data;
    await user.save();

    // Send receipt
    await sendTransactionReceipt(user, transaction);

    console.log(`Airtime purchase successful for user: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Airtime purchase successful',
      data: {
        reference: transaction.reference,
        amount: transaction.amount,
        phoneNumber,
        status: transaction.status,
        timestamp: transaction.createdAt,
      },
    });
  } catch (error) {
    console.log('Failed to purchase airtime', error);

    return res
      .status('500')
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const purchaseData = async (req, res) => {
  try {
  } catch (error) {}
};

export const payCableTV = async (req, res) => {
  try {
  } catch (error) {}
};

export const payUtilityBill = async (req, res) => {
  try {
  } catch (error) {}
};
