// Initiate Verification
export const initiateVerification = async (req, res) => {
  try {
    const { type, number, debitAccountNumber } = req.body;

    if (!type || !number || !debitAccountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, number, or debitAccountNumber',
      });
    }

    const response = await safeHavenService.initiateVerification({
      type,
      number,
      debitAccountNumber,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification initiated successfully',
      data: response,
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
