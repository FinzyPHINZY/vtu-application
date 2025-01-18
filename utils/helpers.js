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
