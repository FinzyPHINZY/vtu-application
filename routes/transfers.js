import express from "express";

import * as TransferController from "../controllers/transferController.js";
import {
	checkSystemStatus,
	tokenExtractor,
	userExtractor,
	validateHeaders,
	validateRequest,
} from "../utils/middleware.js";
import {
	requireTransactionPin,
	validateTransactionPin,
} from "../utils/transactionPin.js";

const router = express.Router();

router.use(checkSystemStatus);
router.use(tokenExtractor);
router.use(userExtractor);

router.post(
	"/verify-recipient",
	validateHeaders,
	validateRequest,
	TransferController.verifyRecipient,
);

router.get(
	"/",
	validateHeaders,
	validateRequest,
	TransferController.getTransferHistory,
);

router.post(
	"/",
	validateHeaders,
	requireTransactionPin,
	validateRequest,
	validateTransactionPin,
	TransferController.createTransfer,
);

export default router;
