import express from 'express';
import userAuth from '../middleware/authMiddleware.js';
import { connnectWallet } from '../controller/depositeController.js';
//import { createDeposite } from '../controller/depositeController.js';
const router = express.Router();

router.post('/deposite', userAuth, connnectWallet);


export default router;
