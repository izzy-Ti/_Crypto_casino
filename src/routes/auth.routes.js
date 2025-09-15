import express from 'express';
import { isAuth, sendVerifyOTP, userLogin, userRegister, verifyOTP } from '../controller/userController.js';
import userAuth from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/signup', userRegister);
router.post('/login', userLogin);
router.post('/sendVerifyOTP', userAuth, sendVerifyOTP);
router.post('/verifyOTP', userAuth, verifyOTP);
router.post('/isAuth', userAuth, isAuth);

export default router;
