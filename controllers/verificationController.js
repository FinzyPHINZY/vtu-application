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
    const { identityId, type, otp } = req.body;

    if (!identityId || !type || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: identityId, type, or otp',
      });
    }

    const response = await safeHavenService.validateVerification({
      identityId,
      type,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification validated successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error validating verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
