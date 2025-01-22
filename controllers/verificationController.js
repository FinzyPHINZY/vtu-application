import axios from 'axios';

// Initiate Verification
export const initiateVerification = async (req, res) => {
  const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;
  try {
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2`,
      req.body,
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
      data: {
        _id: data._id,
        clientId: data.clientId,
        type: data.type,
        amount: data.amount,
        status: data.status,
        debitAccountNumber: data.debitAccountNumber,
        providerResponse: data.providerResponse,
      },
    });
  } catch (error) {
    console.error('Error initiating verification:', error.data);
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

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/identity/v2/validate`,
      req.body,
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
    console.error('Error validating verification:', error.data);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
