import axios from 'axios';

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
      data,
    });
  } catch (error) {
    console.error('Failed to fetch services', error.message);

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
      data: data,
    });
  } catch (error) {
    console.error('Failed to fetch service', error.message);

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

    const { data } = response.data;

    console.log(`Products for category ${categoryId} fetched successfully`);

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data,
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

    if (response.data.statusCode === 400) {
      console.log(
        `Entity verification failed for category ${serviceCategoryId}`
      );
      return res.status(400).json({
        success: false,
        message: 'Verification Failed. Check credentials',
      });
    }
    const { data } = response.data;

    console.log('res', response.data);

    console.log(
      `Entity verification completed for category ${serviceCategoryId}`
    );

    return res.status(200).json({
      success: true,
      message: 'Entity verification successful',
      data,
    });
  } catch (error) {
    console.error('Failed to verify information', error.message);

    return res
      .status(500)
      .json({ success: true, message: 'Internal Server Error' });
  }
};
