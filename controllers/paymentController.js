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

    const user = User.findById(req.userId);

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

    const result = await newTransaction.save();

    user.transactions = user.transactions.concat(result._id);

    // user.transactions.push({
    //   reference: response.data.data.reference,
    //   type: 'deposit',
    //   amount,
    //   currency,
    //   status: 'pending',
    //   metadata: paystackPayload.metadata,
    // });

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
