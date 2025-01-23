export const getServices = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/services`,
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

    console.log('Services successfully fetched');

    return res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to fetch services', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getServicesById = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/service/${id}`,
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

    console.log(`Service ${id} fetched successfully`);

    return res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to fetch service', error);

    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};

export const getServiceCategories = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/service/${id}/service-categories`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response;

    console.log(`Service categories for service ${id} fetched successfully`);

    return res.status(200).json({
      success: true,
      message: 'Service categories fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to fetch service categories');

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getCategoryProducts = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { categoryId } = req.params;

    const response = await axios.get(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/service-category/${categoryId}/products`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const { data } = response;

    console.log(`Products for category ${categoryId} fetched successfully`);

    return res.status(200).json({
      success: false,
      message: 'Products fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to fetch category products');

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const verifyPowerOrTvData = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { serviceCategoryId, entityNumber } = req.body;

    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/vas/verify`,
      {
        serviceCategoryId,
        entityNumber,
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

    const { data } = response;

    console.log(
      `Entity verification completed for category ${serviceCategoryId}`
    );

    return res.status(200).json({
      success: true,
      message: 'Entity verification successful',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to verify information', error);

    return res
      .status(500)
      .json({ success: true, message: 'Internal Server Error' });
  }
};

export const purchaseAirtime = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      serviceCategoryId,
      amount,
      channel = 'WEB',
      debitAccountNumber,
      phoneNumber,
      statusUrl,
    } = req.body;

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/vas/pay/airtime',
      {
        serviceCategoryId,
        amount,
        channel,
        debitAccountNumber,
        phoneNumber,
        statusUrl,
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

    const { data } = response;

    console.log(`Airtime purchase initiated for ${phoneNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Airtime purchase initiated successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Airtime purchase failed:', error);
    return res
      .status(500)
      .json({ success: true, message: 'Airtime purchase failed' });
  }
};

export const purchaseData = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      serviceCategoryId,
      bundleCode,
      amount,
      channel,
      debitAccountNumber,
      phoneNumber,
      statusUrl,
    } = req.body;

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/vas/pay/data',
      {
        serviceCategoryId,
        bundleCode,
        amount,
        channel,
        debitAccountNumber,
        phoneNumber,
        statusUrl,
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

    const { data } = response;

    console.log(`Data bundle purchase initiated for ${phoneNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Data bundle purchase initiated successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Data bundle purchase failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Data bundle purchase failed' });
  }
};

export const purchaseCableTV = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      serviceCategoryId,
      bundleCode,
      amount,
      channel,
      debitAccountNumber,
      cardNumber,
    } = req.body;

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/vas/pay/cable-tv',
      {
        serviceCategoryId,
        bundleCode,
        amount,
        channel,
        debitAccountNumber,
        cardNumber,
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

    const { data } = response;

    console.log(`Cable TV subscription initiated for card ${cardNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Cable TV subscription initiated successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Cable TV subscription failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Cable TV subscription failed' });
  }
};

export const payUtilityBill = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      serviceCategoryId,
      meterNumber,
      amount,
      channel,
      debitAccountNumber,
      vendType,
    } = req.body;

    const response = await axios.post(
      'https://api.sandbox.safehavenmfb.com/vas/pay/utility',
      {
        serviceCategoryId,
        meterNumber,
        amount,
        channel,
        debitAccountNumber,
        vendType,
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

    const { data } = response;

    console.log(`Utility bill payment initiated for meter ${meterNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Utility bill payment initiated successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Utility bill payment failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Utility bill payment failed' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const response = await axios.get(
      'https://api.sandbox.safehavenmfb.com/vas/transactions',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000,
      }
    );

    const { data } = response;

    console.log('VAS transactions fetched successfully');

    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error('Failed to fetch VAS transactions:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const { id } = req.params;

    const response = await axios.get(
      `https://api.sandbox.safehavenmfb.com/vas/transaction/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          ClientID: ibs_client_id,
        },
        timeout: 30000,
      }
    );

    const { data } = response;

    console.log(`VAS transaction ${id} fetched successfully`);

    return res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: data.data,
    });
  } catch (error) {
    console.error(`Failed to fetch VAS transaction ${req.params.id}:`, error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transaction' });
  }
};
