import { body, param, query } from 'express-validator';
import DataPlan from '../../models/DataPlans.js';
import CablePlan from '../../models/CablePlan.js';

export const revenueValidation = [
  query('period')
    .isString()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period specified'),
];

// export const dataPlanValidation = [
//   body('amount')
//     .isFloat({ min: 0 })
//     .withMessage('Amount must be a positive number'),
// ];

export const dataPlanValidation = [
  param('planId').isMongoId().withMessage('Invalid plan ID format'),

  body().custom((_, { req }) => {
    const { isAvailable, sellingPrice } = req.body;

    if (isAvailable === undefined && sellingPrice === undefined) {
      throw new Error(
        'At least one field (isAvailable or sellingPrice) must be provided'
      );
    }
    return true;
  }),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean value')
    .toBoolean(),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be a positive number greater than 0')
    .custom(async (sellingPrice, { req }) => {
      if (sellingPrice) {
        const plan = await DataPlan.findById(req.params.planId);
        if (plan && sellingPrice < plan.amount) {
          throw new Error('Selling price cannot be less than cost price');
        }
      }
      return true;
    })
    .toFloat(),
];

export const createDataPlanValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0')
    .toFloat(),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be a positive number greater than 0')
    .toFloat(),

  // Include other necessary fields for creation
  body('network').notEmpty().withMessage('Network is required'),
  body('planType').notEmpty().withMessage('Plan type is required'),
  body('size').notEmpty().withMessage('Data size is required'),
  body('validity').notEmpty().withMessage('Validity period is required'),
];

export const cablePlanValidation = [
  param('planId').isMongoId().withMessage('Invalid cable plan ID format'),

  body().custom((_, { req }) => {
    const { isAvailable, sellingPrice } = req.body;
    if (isAvailable === undefined && sellingPrice === undefined) {
      throw new Error(
        'At least one field (isAvailable or sellingPrice) must be provided'
      );
    }
    return true;
  }),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean value')
    .toBoolean(),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be a positive number greater than 0')
    .custom(async (sellingPrice, { req }) => {
      if (sellingPrice) {
        const plan = await CablePlan.findById(req.params.planId);
        if (plan && sellingPrice < plan.amount) {
          throw new Error('Selling price cannot be less than cost price');
        }
      }
      return true;
    })
    .toFloat(),
];

export const createCablePlanValidation = [
  body('cablePlanID')
    .isInt({ min: 1 })
    .withMessage('Plan ID must be a positive integer'),

  body('cablename')
    .trim()
    .notEmpty()
    .withMessage('Cable provider name is required'),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Cost price must be a positive number'),

  body('sellingPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be a positive number'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean')
    .toBoolean(),
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

    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st
      endDate = new Date(now.getFullYear(), 11, 31); // December 31st

      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
      break;

    default:
      throw new Error('Invalid period');
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
};
