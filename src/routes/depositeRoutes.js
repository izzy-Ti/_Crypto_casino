import express from 'express';
import userAuth from '../middleware/authMiddleware.js';
import { createDeposite } from '../controller/depositeController.js';
const router = express.Router();

router.post('/deposite', userAuth, createDeposite);


export default router;
