import express from 'express';
import {
  getMediaAIAnalysis,
  reanalyzeMedia,
  markAsAIGenerated,
  getAIGeneratedImages,
  getAIDetectionStats,
  userDisclosesAI,
  getPostAIAnalysis,
} from '../Controllers/aiDetectionController.js';
import authenticate from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/media/:mediaId/analysis', getMediaAIAnalysis);
router.get('/stats', getAIDetectionStats);
router.get('/images/generated/list', getAIGeneratedImages);
router.get('/post/:postId/analysis', getPostAIAnalysis);

// Rutas protegidas
router.use(authenticate);

// Re-analizar
router.post('/media/:mediaId/reanalyze', reanalyzeMedia);

// Usuario declara que su contenido es IA
router.post('/post/:postId/user-disclose-ai', userDisclosesAI);

// Admin - marcar manualmente
router.post('/media/:mediaId/mark-ai', markAsAIGenerated);

export default router;
