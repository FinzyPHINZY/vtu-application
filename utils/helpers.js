import { body } from 'express-validator';

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validationValidation = [
  body('identityId')
    .isString()
    .notEmpty()
    .withMessage('identityId is required'),
  body('type').equals('BVN').withMessage('Verification type must be BVN'),
  body('otp').isString().notEmpty().withMessage('OTP is required'),
];

export const verificationValidation = [
  body('type').equals('BVN').withMessage('Verification type must be BVN'),
  body('async').isBoolean().withMessage('async must be a boolean value'),
  body('number')
    .isString()
    .matches(/^\d{11}$/)
    .withMessage('BVN must be 11 digits'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('debitAccountNumber is required'),
];

export const paymentValidation = [
  body('email').isEmail().normalizeEmail(),
  body('amount')
    .isInt({ min: 10000 }) // Minimum amount 10000 kobo (100 Naira)
    .withMessage('Amount must be at least 100 naira'),
  body('currency')
    .isString()
    .isLength({ min: 3, max: 3 })
    .default('NGN')
    .withMessage('Currency must be a valid 3-letter code'),
  body('callback_url').isURL().withMessage('Callback URL must be a valid URL'),
  body('metadata').isObject().withMessage('Metadata must be an object'),
  body('metadata.purpose')
    .isString()
    .equals('wallet_funding')
    .withMessage('Purpose must be wallet_funding'),
  body('transaction_charge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Transaction charge must be a positive number'),
];
