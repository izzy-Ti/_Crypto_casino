import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);

// Only admin can access routes after this middleware
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
