// Initiate Verification
export const initiateVerification = async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/identity/v2',
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
          ClientID: req.headers.clientid,
        },
        timeout: 30000,
      }
    );

    const { data } = response;

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
    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/identity/v2/validate',
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
          ClientID: req.headers.clientid,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response;

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
