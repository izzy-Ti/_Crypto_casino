import express from 'express';
import { userRegister } from '../controller/userController.js';
const router = express.Router();

router.post('/signup', userRegister);

export default router;
