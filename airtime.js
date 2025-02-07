const executeTransfer = async (req, res, next) => {
  try {
    const { access_token, ibs_client_id } = req.user.safeHavenAccessToken;

    const {
      nameEnquiryReference,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary = false,
      narration = '',
    } = req.body;

    const user = await validateBalance(req.user.id, amount);

    const reference = generateRandomReference('TRF', user.firstName);
    console.log(reference);

    const payload = {
      nameEnquiryReference,
      debitAccountNumber,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      saveBeneficiary,
      narration,
      paymentReference: reference,
    };

    const transactionDetails = {
      reference,
      serviceType: 'bank_transfer',
      metadata: {
        beneficiaryAccount: beneficiaryAccountNumber,
        beneficiaryBank: beneficiaryBankCode,
        narration,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    console.log('Processing transfer...');

    const transactionDoc = await Transaction.findById(transaction.toString());

    try {
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

      const { data } = response;

      transactionDoc.status = 'success';

      await transactionDoc.save();
      await user.save();

      await sendTransactionReceipt(user, transactionDoc);

      return res.status(200).json({
        success: true,
        message: 'Bank transfer completed successfully',
        data,
      });
    } catch (error) {
      console.error('Cable Subscription Failed: ', error);

      transactionDoc.status = 'failed';
      await transactionDoc.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Transfer failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Funds Transfer Failed', error.response);

    next(error);
  }
};

export const purchaseAirtime = async (req, res, next) => {
  try {
    const {
      network,
      amount,
      mobile_number,
      Ported_number,
      airtime_type = 'VTU',
    } = req.body;

    // Validate request body
    if (!network || !amount || !mobile_number || Ported_number === undefined) {
      throw new ApiError(400, false, 'Missing required fields');
    }

    // Validate amount range
    if (amount < 50 || amount > 50000) {
      throw new ApiError(
        400,
        false,
        'Amount must be between 50 and 50000 Naira'
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(mobile_number)) {
      throw new ApiError(
        400,
        false,
        'Invalid phone number format. Must be in format 08XXXXXXXXX'
      );
    }

    // Validate network ID
    if (![1, 2, 3, 4].includes(network)) {
      throw new ApiError(400, false, 'Invalid network provider ID');
    }

    const user = await validateBalance(req.user.id, amount);
    const reference = generateRandomReference('AIR', user.firstName);

    const transactionDetails = {
      reference,
      serviceType: 'airtime',
      metadata: {
        network,
        mobile_number,
        airtime_type,
        Ported_number,
      },
    };

    const transaction = await processTransaction(
      user,
      amount,
      transactionDetails
    );

    const transactionDoc = await Transaction.find({ reference });

    console.log('Deducting funds from Safe Haven account...');

    try {
      // Call the existing `executeTransfer` function to deduct funds
      const transferResponse = await executeTransfer({
        body: {
          nameEnquiryReference: reference,
          debitAccountNumber: user.safeHavenAccountNumber, // Ensure this is set in user profile
          beneficiaryBankCode: '999999', // Use Safe Haven’s internal code if needed
          beneficiaryAccountNumber: process.env.VTU_SERVICE_ACCOUNT, // Your VTU provider's account
          amount,
          saveBeneficiary: false,
          narration: 'Airtime Purchase',
        },
        user: req.user,
      });

      console.log(
        'Fund deduction successful, proceeding with airtime purchase'
      );

      // If fund deduction is successful, make request to DataStation API
      const response = await axios.post(
        'https://datastationapi.com/api/topup/',
        {
          network,
          amount,
          mobile_number,
          Ported_number,
          airtime_type,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          },
        }
      );

      console.log(`Airtime purchase successful for user: ${req.user.id}`);

      // Update transaction based on status
      transactionDoc[0].status = 'success';
      await transactionDoc[0].save();
      await user.save();

      // Send receipt
      await sendTransactionReceipt(user, transaction);

      return res.status(200).json({
        success: true,
        message: 'Airtime purchase successful',
        data: {
          reference: transaction.reference,
          amount,
          network,
          mobile_number,
          status: transaction.status,
          timestamp: transaction.createdAt,
        },
      });
    } catch (error) {
      console.error('Airtime purchase failed:', error.response?.data);

      // Reverse the fund deduction if airtime purchase fails
      console.log('Reversing fund deduction due to failure');
      try {
        await executeTransfer({
          body: {
            nameEnquiryReference: reference,
            debitAccountNumber: process.env.VTU_SERVICE_ACCOUNT,
            beneficiaryBankCode: '999999',
            beneficiaryAccountNumber: user.safeHavenAccountNumber,
            amount,
            saveBeneficiary: false,
            narration: 'Reversal: Airtime Purchase Failed',
          },
          user: req.user,
        });
        console.log('Fund refund successful');
      } catch (refundError) {
        console.error('Fund refund failed:', refundError.response?.data);
      }

      // Update transaction as failed
      transactionDoc[0].status = 'failed';
      await transactionDoc[0].save();
      await user.save();

      throw new ApiError(
        error.response?.status || 500,
        false,
        error.response?.data?.message || 'Airtime purchase failed',
        error.response?.data
      );
    }
  } catch (error) {
    console.error('Airtime purchase failed:', error);
    next(error);
  }
};
