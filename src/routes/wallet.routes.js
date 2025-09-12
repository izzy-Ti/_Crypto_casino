import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getWallet,
  deposit,
  withdraw,
  getTransactionHistory,
  getDepositAddress
} from '../controllers/wallet.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/', getWallet);
router.get('/transactions', getTransactionHistory);
router.get('/deposit-address', getDepositAddress);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

export default router;
