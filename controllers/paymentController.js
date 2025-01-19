import axios from 'axios';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const initializePayment = async (req, res, next) => {
  try {
    const {
      email,
      amount,
      currency = 'NGN',
      callback_url,
      metadata,
      transaction_charge,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const paystackPayload = {
      email,
      amount,
      currency,
      callback_url,
      metadata: { ...metadata, userId: req.userId },
    };

    if (transaction_charge) {
      paystackPayload.transaction_charge = transaction_charge;
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const newTransaction = await Transaction.create({
      reference: response.data.data.reference,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      metadata: paystackPayload.metadata,
      user: user._id,
    });

    console.log(newTransaction);

    const result = await newTransaction.save();

    if (!Array.isArray(user.transactions)) {
      user.transactions = [];
    }

    user.transactions = user.transactions.concat(result._id);

    await user.save();

    console.log(`Payment initialization successful for user: ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Payment initialization successful',
      data: {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      },
    });
  } catch (error) {
    //
    console.error('Payment initialization failed', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const user = await User.findById(req.userId).populate('transactions');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const transaction = user.transactions.find(
      (t) => t.reference === reference
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status === 'success') {
      return res
        .status(400)
        .json({ success: false, message: 'Transaction completed already' });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response.data;

    if (data.metadata.userId !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized transaction access' });
    }

    if (data.status === 'success') {
      if (data.amount !== transaction.amount) {
        console.log(`Amount mismatch for Transaction ${reference}`);
        return res
          .status(400)
          .json({ success: false, message: 'Transaction amount mismatch' });
      }

      transaction.status = 'success';

      user.accountBalance += transaction.amount / 100;

      await user.save();

      console.log(
        `Transaction ${reference} verified and processed successfully`
      );

      res.status(200).json({
        success: true,
        message: 'Transaction verified successfully',
        data: {
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          accountBalance: user.accountBalance,
          currency: transaction.currency,
          paidAt: data.paid_at,
        },
      });
    } else {
      transaction.status = 'failed';
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Transaction failed or pending',
        status: data.status,
        gateway_response: data.gateway_response,
      });
    }
  } catch (error) {
    console.error(
      `Transaction verification failed for "${req.params.reference}":`,
      error
    );

    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
