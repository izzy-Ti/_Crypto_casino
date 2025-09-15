import express from 'express';
import userAuth from '../middleware/authMiddleware.js';
import { createTransaction } from '../controller/depositeController.js';
const router = express.Router();

router.post('/deposite', userAuth, createTransaction);


export default router;
