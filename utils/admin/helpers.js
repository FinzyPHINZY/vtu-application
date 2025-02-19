import { body, param, query } from 'express-validator';

export const revenueValidation = [
  query('period')
    .isString()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period specified'),
];

export const dataPlanValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
];

export const createDataPlanValidation = [
  body('data_id').isFloat().withMessage('Data Id must be a number'),
  body('network')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Network is required'),
  body('planType')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Plan Type is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('size').isString().trim().notEmpty().withMessage('Size is required'),
  body('validity')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Validity is required'),
];

export const cablePlanValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
];

export const createCablePlanValidation = [
  body('cablePlanID').isFloat().withMessage('Cable plan id is required'),
  body('cablename')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('cable name is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
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

export const getDateRange = (period) => {
  const now = new Date();

  let startDate, endDate, prevStartDate, prevEndDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate = new Date(endDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      break;

    case 'weekly':
      const startOfWeek = now.getDate() - now.getDay(); // Get Sunday of this week
      startDate = new Date(now.setDate(startOfWeek));
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      prevEndDate = new Date(endDate);
      prevEndDate.setDate(prevEndDate.getDate() - 7);
      break;

    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevEndDate = new Date(endDate);
      prevEndDate.setMonth(prevEndDate.getMonth() - 1);
      break;

    default:
      throw new Error('Invalid period');
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
};
