import express from 'express';
import * as ProductController from '../../controllers/admin/productController.js';
import {
  adminAuth,
  tokenExtractor,
  userExtractor,
  validateHeaders,
  validateRequest,
} from '../../utils/middleware.js';
import {
  cablePlanValidation,
  createCablePlanValidation,
  createDataPlanValidation,
  dataPlanValidation,
  planIdValidation,
} from '../../utils/admin/helpers.js';

const router = express.Router();

router.use(validateHeaders);
router.use(tokenExtractor);
router.use(userExtractor);
router.use(adminAuth);

router.put(
  '/data-plans/:planId',
  planIdValidation,
  dataPlanValidation,
  validateRequest,
  ProductController.updateDataPlan
);

router.put(
  '/cable-plans/:planId',
  planIdValidation,
  cablePlanValidation,
  validateRequest,
  ProductController.updateCablePlan
);

router.post(
  '/data-plans',
  createDataPlanValidation,
  validateRequest,
  ProductController.createDataPlan
);

router.post(
  '/cable-plans',
  createCablePlanValidation,
  validateRequest,
  ProductController.createCablePlan
);

router.delete(
  '/data-plans/:planId',
  planIdValidation,
  validateRequest,
  ProductController.deleteDataPlan
);

router.delete(
  '/cable-plans/:planId',
  planIdValidation,
  validateRequest,
  ProductController.deleteCablePlan
);

export default router;
