import express from 'express';
import { sendVerifyOTP, userLogin, userRegister } from '../controller/userController.js';
import userAuth from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/signup', userRegister);
router.post('/login', userLogin);
router.post('/sendVerifyOTP', userAuth, sendVerifyOTP);

export default router;
