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
  // body('type').equals('BVN').withMessage('Verification type must be BVN'),
  body('otp').isString().notEmpty().withMessage('OTP is required'),
];

export const verificationValidation = [
  // body('async').isBoolean().withMessage('async must be a boolean value'),
  body('number')
    .isString()
    .matches(/^\d{11}$/)
    .withMessage('BVN must be 11 digits'),
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

// Data purchase validation
export const dataPurchaseValidation = [
  body('network')
    .isInt({ min: 1, max: 4 })
    .withMessage('Invalid network provider ID'),
  body('mobile_number')
    .matches(/^0\d{10}$/)
    .withMessage('Invalid phone number format. Must be in format 0XXXXXXXXXX'),
  body('plan').isInt({ min: 1 }).withMessage('Invalid plan ID'),
  body('Ported_number')
    .isBoolean()
    .withMessage('Ported_number must be a boolean'),
  body('transactionPin')
    .isString()
    .matches(/^\d{4}$/)
    .withMessage('Transaction PIN must be 4 digits'),
];

// Airtime purchase validation
export const airtimePurchaseValidation = [
  body('network')
    .isInt({ min: 1, max: 4 })
    .withMessage('Invalid network provider ID'),
  body('amount')
    .isInt({ min: 50, max: 50000 })
    .withMessage('Amount must be between 50 and 50000 Naira'),
  body('mobile_number')
    .matches(/^(0(7[01-9]|8[01-9]|9[01-9])\d{8})$/)
    .withMessage('Invalid phone number format. Must be in format 08XXXXXXXXX'),
  body('Ported_number')
    .isBoolean()
    .withMessage('Ported_number must be a boolean'),
  body('airtime_type')
    .optional()
    .equals('VTU')
    .withMessage('Only VTU airtime type is supported'),
  body('transactionPin')
    .isString()
    .matches(/^\d{4}$/)
    .withMessage('Transaction PIN must be 4 digits'),
];

export const transactionPinValidation = [
  body('transactionPin')
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

export const generateRandomReference = (prefix, firstName) => {
  const timestamp = Date.now();
  const userName = firstName || 'User'; // Default if firstName is missing
  return `${prefix}_${userName}_${timestamp}`;
};

export const generateTransferReference = () => {
  const prefix = 'TF_';
  const randomValue = Math.floor(1000000 + Math.random() * 9000000); // Random 7-digit number
  return `${prefix}${randomValue}`;
};

export const nameEnquiryValidation = [
  body('bankCode').isString().notEmpty().withMessage('Bank code is required'),
  body('accountNumber')
    .isString()
    .matches(/^\d{10}$/)
    .withMessage('Account number must be 10 digits'),
];

export const transferValidation = [
  body('nameEnquiryReference')
    .isString()
    .notEmpty()
    .withMessage('Name enquiry reference is required'),
  body('debitAccountNumber')
    .isString()
    .matches(/^\d{10}$/)
    .withMessage('Debit account number must be 10 digits'),
  body('beneficiaryBankCode')
    .isString()
    .notEmpty()
    .withMessage('Beneficiary bank code is required'),
  body('beneficiaryAccountNumber')
    .isString()
    .matches(/^\d{10}$/)
    .withMessage('Beneficiary account number must be 10 digits'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('saveBeneficiary')
    .optional()
    .isBoolean()
    .withMessage('Save beneficiary must be a boolean'),
  body('narration').isString().notEmpty().withMessage('Narration is required'),
  body('transactionPin')
    .isString()
    .matches(/^\d{4}$/)
    .withMessage('Transaction PIN must be 4 digits'),
];

export const statusValidation = [
  body('sessionId').isString().notEmpty().withMessage('Session ID is required'),
];

export const historyValidation = [
  query('accountId')
    .isString()
    .notEmpty()
    .withMessage('Account ID is required'),
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
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid date'),
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid date'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
];
