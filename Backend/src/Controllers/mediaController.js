import Media from '../models/Media.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';
import AIDetectionService from '../services/aiDetectionService.js';
import { analyzeImageForAI } from './aiDetectionController.js';

/**
 * Subir archivo de media (imagen, video, audio)
 */
export const uploadMedia = asyncHandler(async (req, res, next) => {
  if (!req.uploadedFile) {
    return next(new AppError('No file uploaded', HTTP_STATUS.BAD_REQUEST));
  }

  const { filename, originalName, mimetype, size, path: filePath, type } = req.uploadedFile;

  try {
    // Crear documento de media
    const media = await Media.create({
      filename: filePath,
      originalName,
      mimetype,
      size,
      url: `/uploads/${filename}`,
      uploadedBy: req.user.userId,
      type,
      aiDetectionStatus: 'pending'
    });

    // Si es imagen, iniciar análisis de IA de forma asíncrona
    if (type === 'image') {
      // No esperar a que se complete, hacerlo en background
      analyzeImageForAI(media._id, filePath).catch((error) => {
        console.error('Background AI analysis error:', error.message);
      });
    }

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        mediaId: media._id,
        filename: media.originalName,
        url: media.url,
        type: media.type,
        size: media.size,
        aiDetectionStatus: media.aiDetectionStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Obtener información de una media
 */
export const getMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId)
    .populate('uploadedBy', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .populate('ratings.user', 'username profilePicture');

  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: media,
  });
});

export const addMediaComment = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;
  const { text, stars = 5 } = req.body;

  if (!text || !text.trim()) {
    return next(new AppError('Comment text is required', HTTP_STATUS.BAD_REQUEST));
  }

  const media = await Media.findById(mediaId);
  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  media.comments.push({
    user: req.user.userId,
    text: text.trim(),
    stars: Number(stars) >= 1 && Number(stars) <= 5 ? Number(stars) : 5,
  });

  await media.save();

  const populatedMedia = await Media.findById(mediaId)
    .populate('uploadedBy', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .populate('ratings.user', 'username profilePicture');

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: populatedMedia,
  });
});

export const rateMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;
  const { stars } = req.body;

  const ratingValue = Number(stars);
  if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return next(new AppError('Rating must be a number between 1 and 5', HTTP_STATUS.BAD_REQUEST));
  }

  const media = await Media.findById(mediaId);
  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  const existingRating = media.ratings.find((rating) => rating.user.toString() === req.user.userId);
  if (existingRating) {
    existingRating.stars = ratingValue;
  } else {
    media.ratings.push({ user: req.user.userId, stars: ratingValue });
  }

  const totalStars = media.ratings.reduce((total, rating) => total + rating.stars, 0);
  media.ratingCount = media.ratings.length;
  media.ratingAverage = media.ratingCount ? parseFloat((totalStars / media.ratingCount).toFixed(2)) : 0;

  await media.save();

  const populatedMedia = await Media.findById(mediaId)
    .populate('uploadedBy', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .populate('ratings.user', 'username profilePicture');

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: populatedMedia,
  });
});

/**
 * Obtener todas las medias de un usuario
 */
export const getUserMedia = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [media, total] = await Promise.all([
    Media.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Media.countDocuments({ uploadedBy: userId }),
  ]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: media,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Eliminar una media
 */
export const deleteMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos
  if (media.uploadedBy.toString() !== req.user.userId && !req.user.isAdmin) {
    return next(new AppError('No autorizado para eliminar este archivo', HTTP_STATUS.FORBIDDEN));
  }

  // TODO: Eliminar archivo físico si es necesario

  await Media.findByIdAndDelete(mediaId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Media deleted successfully',
  });
});

/**
 * Obtener todos los videos subidos
 */
export const getAllVideos = asyncHandler(async (req, res, next) => {
  const videos = await Media.find({ type: 'video' })
    .populate('uploadedBy', 'username profilePicture')
    .sort({ createdAt: -1 });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: videos,
  });
});

export default {
  uploadMedia,
  getMedia,
  getUserMedia,
  deleteMedia,
  getAllVideos,
};
