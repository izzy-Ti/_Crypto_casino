import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getAllGames,
  createGame,
  getGame,
  updateGame,
  deleteGame,
  placeBet,
  getGameHistory
} from '../controllers/game.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllGames);
router.get('/:id', getGame);
router.get('/:id/history', getGameHistory);

// Protected routes
router.use(protect);

router.post('/', createGame);
router.post('/:id/bet', placeBet);
router
  .route('/:id')
  .patch(updateGame)
  .delete(deleteGame);

export default router;
