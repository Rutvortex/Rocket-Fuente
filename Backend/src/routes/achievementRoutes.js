import express from 'express';
import {
  createAchievement,
  getAchievements,
  getUserAchievements,
  unlockAchievement,
  getUserAchievementStats
} from '../Controllers/achievementController.js';
import authenticate from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAchievements);
router.get('/user/:userId', getUserAchievements);
router.get('/stats/:userId', getUserAchievementStats);

// Rutas protegidas
router.post('/', authenticate, createAchievement); // Solo administradores
router.post('/unlock', authenticate, unlockAchievement); // Desbloquear logro

export default router;
