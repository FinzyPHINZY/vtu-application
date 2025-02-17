import { body, param, query } from 'express-validator';

export const revenueValidation = [
  query('period')
    .isString()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period specified'),
];

export const dataPlanValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('data_amount')
    .isFloat({ min: 0 })
    .withMessage('Data amount must be a positive number'),
  body('validity')
    .isInt({ min: 1 })
    .withMessage('Validity must be at least 1 day'),
];

export const cablePlanValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('channels')
    .isArray()
    .withMessage('Channels must be an array')
    .notEmpty()
    .withMessage('At least one channel is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
];

export const planIdValidation = [
  param('planId').isMongoId().withMessage('Invalid plan ID format'),
];

export const userActivityValidation = [
  query('user_id').isMongoId().withMessage('Invalid user ID format'),
];

export const ticketsValidation = [
  query('status')
    .isString()
    .isIn(['open', 'closed', 'pending'])
    .withMessage('Invalid ticket status'),
];

export const updateTicketValidation = [
  param('ticketId').isMongoId().withMessage('Invalid ticket ID format'),
  body('status')
    .isString()
    .isIn(['open', 'closed', 'pending'])
    .withMessage('Invalid ticket status'),
  body('response')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Response cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Response must not exceed 1000 characters'),
];

export const shutdownValidation = [
  body('reason')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('duration')
    .isInt({ min: 5, max: 1440 })
    .withMessage('Duration must be between 5 and 1440 minutes'),
];

export const listQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const transactionIdValidation = [
  param('transactionId')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
];

export const broadcastValidation = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
  body('user_segments')
    .isArray()
    .withMessage('User segments must be an array')
    .notEmpty()
    .withMessage('At least one user segment is required'),
];

export const directMessageValidation = [
  body('user_id').isMongoId().withMessage('Invalid user ID format'),
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
];
