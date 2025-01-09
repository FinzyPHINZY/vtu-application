import Transaction from '../models/Transaction';

const logTransaction = async (
  transactionId,
  type,
  userId,
  amount,
  phoneNumber,
  status
) => {
  await Transaction.create({
    transactionId,
    userId,
    phoneNumber,
    amount,
    status,
    date: new Date(),
  });
};
