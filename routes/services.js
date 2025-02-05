import express from 'express';
import * as servicesController from '../controllers/servicesController.js';
// import {
//   tokenExtractor,
//   userExtractor,
//   validateHeaders,
//   validateRequest,
// } from '../utils/middleware.js';
// import {
//   airtimeValidation,
//   cableTVValidation,
//   dataValidation,
//   serviceIdValidation,
//   transactionIdValidation,
//   utilityValidation,
//   verifyEntityValidation,
// } from '../utils/helpers.js';
const router = express.Router();

// // Middlewares
// router.use(tokenExtractor);
// router.use(userExtractor);

// // get services
// router.get('/', validateHeaders, servicesController.getServices);

// // get service
// router.get(
//   '/:id/service',
//   validateHeaders,
//   serviceIdValidation,
//   validateRequest,
//   servicesController.getServicesById
// );

// // get service categories
// router.get(
//   '/:id/service-categories',
//   validateHeaders,
//   serviceIdValidation,
//   validateRequest,
//   servicesController.getServiceCategories
// );

// // verify information
// router.post(
//   '/verify',
//   validateHeaders,
//   verifyEntityValidation,
//   validateRequest,
//   servicesController.verifyPowerOrTvData
// );

// // get category products:
// router.get(
//   '/service-categories/products/:categoryId',
//   validateHeaders,
//   validateRequest,
//   servicesController.getCategoryProducts
// );

export default router;
