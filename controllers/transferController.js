import axios from 'axios';

const debitAccountNumber = process.env.SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER;

export const getBankList = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    console.log('Fetching bank list');

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/banks`,
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
    console.log('Fetched Bank List Successfully');

    return res
      .status(201)
      .json({ success: true, message: 'Banks fetched successfully', data });
  } catch (error) {
    console.error('Failed to get bank list', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyBankAccount = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { bankCode, accountNumber } = req.body;

    const payload = { bankCode, accountNumber };

    // post request to safe haven
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/name-enquiry`,
      payload,
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

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data,
    });
  } catch (error) {
    console.error('Failed to verify account information', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const transferFunds = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      nameEnquiryReference,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference,
    } = req.body;

    const payload = {
      nameEnquiryReference,
      debitAccountNumber,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference,
    };

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers`,
      payload,
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

    return res.status(200).json({
      success: true,
      message: 'Bank transfer completed successfully',
      data,
    });
  } catch (error) {
    console.error('Funds Transfer Failed', error.response.data);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getTransferStatus = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { sessionId } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/transfers/status`,
      { sessionId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
      }
    );

    const { data } = response.data;

    console.log('Transfer status checked successfully');

    return res.status(200).json({
      success: true,
      message: 'Transfer status fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Failed to check transfer status', error.response.data);

    return res
      .status(500)
      .json({ success: false, message: 'Failed to check transfer status' });
  }
};
