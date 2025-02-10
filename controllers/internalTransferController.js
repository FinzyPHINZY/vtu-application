import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import ApiError from '../utils/error.js';
import { generateRandomReference } from '../utils/helpers.js';

export const lookupPayee = async (req, res, next) => {
  try {
    const { email } = req.body;

    const payee = await User.findOne({ email });

    if (!payee) {
      throw new ApiError(
        404,
        false,
        'No Bold Data user found with this email address'
      );
    }

    // prevent user transferring funds to self
    if (payee._id.toString() === req.user.id) {
      throw new ApiError(400, false, 'Cannot transfer to your own account');
    }

    console.log(`Payee lookup successful for email: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Payee found',
      data: {
        id: payee._id,
        firstName: payee.firstName,
        lastName: payee.lastName,
        email: payee.email,
      },
    });
  } catch (error) {
    console.error('Payee lookup failed', error);
    next(error);
  }
};

export const transfer = async (req, res, next) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { payeeId, amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      throw new ApiError(400, false, 'Amount must be at least 100 naira');
    }

    // Find payer and atomically deduct balance
    const updatedPayer = await User.findOneAndUpdate(
      { _id: req.user.id, accountBalance: { $gte: amount } },
      { $inc: { accountBalance: -amount } },
      { new: true, session }
    );

    if (!updatedPayer) {
      throw new ApiError(400, false, 'Insufficient funds');
    }

    // Find payee
    const payee = await User.findById(payeeId).session(session);
    if (!payee) {
      throw new ApiError(404, false, 'Payee account not found');
    }

    // Generate references
    const payerReference = generateRandomReference(
      'TRF_PAYER',
      updatedPayer.firstName
    );
    const payeeReference = generateRandomReference('TRF_PAYE', payee.firstName);

    // Record timestamp
    const timestamp = new Date();

    // Create transactions within session
    const [payerTransaction, payeeTransaction] = await Transaction.create(
      [
        {
          reference: payerReference,
          type: 'debit',
          serviceType: 'bank_transfer',
          amount,
          status: 'success',
          metadata: {
            transferType: 'internal_transfer',
            recipientId: payee._id,
            recipientEmail: payee.email,
            timestamp,
          },
          previousBalance: updatedPayer.accountBalance + amount,
          newBalance: updatedPayer.accountBalance,
        },
        {
          reference: payeeReference,
          type: 'credit',
          serviceType: 'bank_transfer',
          amount,
          status: 'success',
          metadata: {
            transferType: 'internal_transfer',
            senderId: updatedPayer._id,
            senderEmail: updatedPayer.email,
            timestamp,
          },
          previousBalance: payee.accountBalance,
          newBalance: payee.accountBalance + amount,
        },
      ],
      { session }
    );

    // Update payee balance
    await User.findByIdAndUpdate(
      payeeId,
      { $inc: { accountBalance: amount } },
      { session }
    );

    // Push transactions to users
    await User.findByIdAndUpdate(
      updatedPayer._id,
      { $push: { transactions: payerTransaction._id } },
      { session }
    );
    await User.findByIdAndUpdate(
      payee._id,
      { $push: { transactions: payeeTransaction._id } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    console.log(`Internal transfer successful: ${payerReference}`, {
      amount,
      payerId: updatedPayer._id,
      payeeId: payee._id,
    });

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        reference: payerReference,
        amount,
        timestamp,
        payee: {
          id: payee._id,
          email: payee.email,
        },
        newBalance: updatedPayer.accountBalance,
      },
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Failed to abort transaction:', abortError);
    }
    console.error('Internal transfer failed:', error);
    next(error);
  } finally {
    session.endSession();
  }
};
