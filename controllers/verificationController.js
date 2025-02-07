import axios from 'axios';

const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER;

// Initiate Verification
export const initiateVerification = async (req, res) => {
  const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;
  try {
    const { number } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2`,
      {
        number,
        async: false,
        type: 'BVN',
        debitAccountNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000,
      }
    );

    const { data } = response.data;

    res.status(200).json({
      success: true,
      message: 'Verification initiated successfully',
      data,
    });
  } catch (error) {
    console.error('Error initiating verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Validate Verification
export const validateVerification = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { identityId, otp } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2/validate`,
      {
        identityId,
        otp,
        type: 'BVN',
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response.data;

    res.status(200).json({
      statusCode: 200,
      data: {
        _id: data._id,
        clientId: data.clientId,
        type: data.type,
        amount: data.amount,
        status: data.status,
        debitAccountNumber: data.debitAccountNumber,
        providerResponse: data.providerResponse,
        transaction: data.transaction,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      message: data.message || 'Verification validated successfully',
    });
  } catch (error) {
    console.error('Error validating verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
