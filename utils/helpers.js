import { body, param, query } from 'express-validator';

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

export const paymentVerificationValidation = [
  param('reference')
    .isString()
    .notEmpty()
    .withMessage('Transaction reference is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid transaction reference format'),
];

export const subAccountValidation = [
  body('phoneNumber')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format. Must include country code'),
  body('emailAddress')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('externalReference')
    .isString()
    .notEmpty()
    .withMessage('External reference is required'),
  body('identityType')
    .isString()
    .default('BVN')
    .isIn(['BVN'])
    .withMessage('Invalid identity type'),
  body('identityNumber')
    .matches(/^\d{11}$/)
    .withMessage('Identity number must be 11 digits'),
  body('identityId')
    .isString()
    .notEmpty()
    .withMessage('Identity ID is required'),
  body('otp').isString().notEmpty().withMessage('OTP is required'),
  body('autoSweep')
    .isBoolean()
    .default(false)
    .withMessage('autoSweep must be a boolean'),
  body('autoSweepDetails')
    .isObject()
    .default({ schedule: 'Instant' })
    .withMessage('Invalid autoSweepDetails format'),
];

export const accountIdValidation = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Account ID is required')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Invalid account ID format'),
];

export const serviceIdValidation = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Service ID is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Invalid service ID format'),
];

export const verifyEntityValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Invalid service category ID format'),
  body('entityNumber')
    .isString()
    .notEmpty()
    .withMessage('Entity number is required'),
];

export const airtimeValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('channel').optional().isString().default('WEB'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
  body('phoneNumber')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('statusUrl').isURL().withMessage('Valid status URL is required'),
];

export const dataValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('bundleCode')
    .isString()
    .notEmpty()
    .withMessage('Bundle code is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('channel').isString().notEmpty().withMessage('Channel is required'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
  body('phoneNumber')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('statusUrl').isURL().withMessage('Valid status URL is required'),
];

export const cableTVValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('bundleCode')
    .isString()
    .notEmpty()
    .withMessage('Bundle code is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('channel').isString().notEmpty().withMessage('Channel is required'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
  body('cardNumber')
    .isString()
    .notEmpty()
    .withMessage('Card number is required'),
];

export const utilityValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('meterNumber')
    .isString()
    .notEmpty()
    .withMessage('Meter number is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('channel').isString().notEmpty().withMessage('Channel is required'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
  body('vendType').isString().notEmpty().withMessage('Vend type is required'),
];

export const transactionIdValidation = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Invalid transaction ID format'),
];

export const accountsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Page must be a non-negative integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('isSubAccount')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('isSubAccount must be a boolean'),
];

export const airtimeTransactionValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('phoneNumber')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
];

export const dataTransactionValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('bundleCode')
    .isString()
    .notEmpty()
    .withMessage('Bundle code is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('phoneNumber')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
];

export const cableTVTransactionValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('bundleCode')
    .isString()
    .notEmpty()
    .withMessage('Bundle code is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('cardNumber')
    .isString()
    .notEmpty()
    .withMessage('Card number is required'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
];

export const utilityTransactionValidation = [
  body('serviceCategoryId')
    .isString()
    .notEmpty()
    .withMessage('Service category ID is required'),
  body('meterNumber')
    .isString()
    .notEmpty()
    .withMessage('Meter number is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('vendType').isString().notEmpty().withMessage('Vend type is required'),
  body('debitAccountNumber')
    .isString()
    .notEmpty()
    .withMessage('Debit account number is required'),
];

export const transactionPinValidation = [
  body('pin')
    .isString()
    .isLength({ min: 4, max: 4 })
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
];

export const googleLoginValidation = [
  body('idToken')
    .isString()
    .notEmpty()
    .withMessage('Google ID token is required'),
];

export const registrationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
];

export const passwordValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
    .withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
    ),
];

export const generateRandomReference = () => {
  const prefix = 'AC_';
  const randomValue = Math.floor(1000000 + Math.random() * 9000000); // Random 7-digit number
  return `${prefix}${randomValue}`;
};
