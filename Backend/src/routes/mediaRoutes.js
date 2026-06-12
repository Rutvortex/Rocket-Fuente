import express from 'express';
import { uploadMedia, getMedia, getUserMedia, deleteMedia, getAllVideos, addMediaComment, rateMedia } from '../controllers/mediaController.js';
import authenticate from '../middlewares/authMiddleware.js';
import upload, { processUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllVideos);
router.get('/user/:userId', getUserMedia);
router.get('/:mediaId', getMedia);

// Rutas protegidas
router.use(authenticate);

// Subir media
router.post('/upload', upload.single('file'), processUpload, uploadMedia);

// Comentarios de media
router.post('/:mediaId/comment', authenticate, addMediaComment);

// Calificar media
router.put('/:mediaId/rate', authenticate, rateMedia);

// Eliminar media
router.delete('/:mediaId', deleteMedia);

export default router;
