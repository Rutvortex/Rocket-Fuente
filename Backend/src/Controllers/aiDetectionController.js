import Media from '../models/Media.js';
import Post from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';
import AIDetectionService from '../services/aiDetectionService.js';
import fs from 'fs';

/**
 * Analizar una imagen subida para detectar si fue generada con IA
 * Se ejecuta automáticamente cuando se sube una imagen
 */
export const analyzeImageForAI = async (mediaId, imagePath) => {
  const media = await Media.findById(mediaId);

  if (!media) {
    throw new AppError('Media not found', HTTP_STATUS.NOT_FOUND);
  }

  // Solo procesar imágenes
  if (!media.type.includes('image')) {
    media.aiDetectionStatus = 'completed';
    await media.save();
    return;
  }

  try {
    media.aiDetectionStatus = 'analyzing';
    await media.save();

    // Ejecutar análisis
    const analysisResult = await AIDetectionService.analyzeImage(imagePath);

    if (analysisResult && analysisResult.methods.length > 0) {
      // Guardar resultados
      media.aiDetectionMethods = analysisResult.methods;
      media.overallConfidence = analysisResult.overallConfidence;
      media.isAIGenerated = analysisResult.overallIsAI;

      media.aiDetectionStatus = 'completed';

      if (analysisResult.metadata) {
        media.hasMetadata = analysisResult.metadata.hasAIIndicators;
        media.metadataInfo = analysisResult.metadata;
      }
    } else {
      // No se pudo analizar
      media.aiDetectionStatus = 'failed';
      media.aiDetectionError = 'No detection methods available';
    }

    await media.save();
    return media;
  } catch (error) {
    media.aiDetectionStatus = 'failed';
    media.aiDetectionError = error.message;
    await media.save();
    throw error;
  }
};

/**
 * Obtener análisis de detección de IA para una media
 */
export const getMediaAIAnalysis = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      mediaId: media._id,
      filename: media.originalName,
      isAIGenerated: media.isAIGenerated,
      confidence: media.overallConfidence,
      status: media.aiDetectionStatus,
      methods: media.aiDetectionMethods,
      hasMetadata: media.hasMetadata,
      metadataIndicators: media.metadataInfo?.indicators,
      analyzedAt: media.aiDetectionMethods?.[0]?.timestamp,
      error: media.aiDetectionError,
    },
  });
});

/**
 * Re-analizar una imagen (para recalcular detección)
 */
export const reanalyzeMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos (solo creador o admin)
  if (
    media.uploadedBy.toString() !== req.user.userId &&
    !req.user.isAdmin
  ) {
    return next(
      new AppError(
        'No tienes permiso para re-analizar este archivo',
        HTTP_STATUS.FORBIDDEN
      )
    );
  }

  // Verificar que el archivo existe
  if (!fs.existsSync(media.filename)) {
    return next(new AppError('Media file not found', HTTP_STATUS.NOT_FOUND));
  }

  try {
    const result = await analyzeImageForAI(mediaId, media.filename);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Media re-analyzed successfully',
      data: {
        mediaId: result._id,
        isAIGenerated: result.isAIGenerated,
        confidence: result.overallConfidence,
        status: result.aiDetectionStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Marcar manualmente una imagen como generada por IA (admin)
 */
export const markAsAIGenerated = asyncHandler(async (req, res, next) => {
  const user = await (await import('../models/User.js')).default.findById(
    req.user.userId
  );

  // Solo admins pueden marcar manualmente
  if (!user || !user.isAdmin) {
    return next(
      new AppError('Solo administradores pueden marcar contenido', HTTP_STATUS.FORBIDDEN)
    );
  }

  const { mediaId } = req.params;
  const { isAI, reason } = req.body;

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new AppError('Media not found', HTTP_STATUS.NOT_FOUND));
  }

  // Marcar
  media.isAIGenerated = isAI;
  media.markedBy = req.user.userId;
  media.markedAt = new Date();
  media.markedReason = reason || 'Admin review';

  // Si es por admin review, marcar como verificado
  if (!media.aiDetectionMethods) {
    media.aiDetectionMethods = [];
  }

  media.aiDetectionMethods.push({
    method: 'admin_review',
    confidence: 100,
    isAI: isAI,
    timestamp: new Date(),
  });

  media.overallConfidence = 100;
  media.aiDetectionStatus = 'completed';

  await media.save();

  // Actualizar todos los posts que usen esta media
  await Post.updateMany(
    { media: mediaId },
    {
      hasAIContent: isAI,
      aiDetectionConfidence: 100,
      aiWarning: isAI ? 'confirmed_ai' : 'none',
    }
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Image marked as ${isAI ? 'AI generated' : 'authentic'}`,
    data: media,
  });
});

/**
 * Obtener todas las imágenes marcadas como IA
 */
export const getAIGeneratedImages = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [media, total] = await Promise.all([
    Media.find({ isAIGenerated: true })
      .populate('uploadedBy', 'username profilePicture')
      .populate('markedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Media.countDocuments({ isAIGenerated: true }),
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
 * Obtener estadísticas de detección de IA
 */
export const getAIDetectionStats = asyncHandler(async (req, res) => {
  const stats = await Media.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        aiGenerated: [
          { $match: { isAIGenerated: true } },
          { $count: 'count' },
        ],
        pending: [
          { $match: { aiDetectionStatus: 'pending' } },
          { $count: 'count' },
        ],
        analyzing: [
          { $match: { aiDetectionStatus: 'analyzing' } },
          { $count: 'count' },
        ],
        failed: [
          { $match: { aiDetectionStatus: 'failed' } },
          { $count: 'count' },
        ],
        avgConfidence: [
          { $group: { _id: null, avg: { $avg: '$overallConfidence' } } },
        ],
      },
    },
  ]);

  const data = stats[0];

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalImages: data.total[0]?.count || 0,
      aiGeneratedCount: data.aiGenerated[0]?.count || 0,
      pendingAnalysis: data.pending[0]?.count || 0,
      analyzing: data.analyzing[0]?.count || 0,
      failedAnalysis: data.failed[0]?.count || 0,
      averageConfidence: Math.round(data.avgConfidence[0]?.avg || 0),
      aiPercentage: ((data.aiGenerated[0]?.count || 0) / (data.total[0]?.count || 1)) * 100,
    },
  });
});

/**
 * El usuario discierra que la imagen fue hecha con IA
 */
export const userDisclosesAI = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar que sea el autor
  if (post.author.toString() !== req.user.userId) {
    return next(
      new AppError(
        'Solo el autor puede marcar su contenido',
        HTTP_STATUS.FORBIDDEN
      )
    );
  }

  // Marcar como disclosed
  post.userDisclosedAI = true;
  post.aiWarning = 'user_disclosed';
  post.hasAIContent = true;

  await post.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message:
      'You have disclosed that this content was created with AI. Thank you for transparency!',
    data: post,
  });
});

/**
 * Obtener análisis de IA de un post
 */
export const getPostAIAnalysis = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate('media');

  if (!post) {
    return next(new AppError('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  const analysis = {
    hasAIContent: post.hasAIContent,
    confidence: post.aiDetectionConfidence,
    warning: post.aiWarning,
    userDisclosed: post.userDisclosedAI,
    mediaAnalysis: post.media
      ? {
          mediaId: post.media._id,
          isAI: post.media.isAIGenerated,
          confidence: post.media.overallConfidence,
          methods: post.media.aiDetectionMethods,
        }
      : null,
  };

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: analysis,
  });
});

export default {
  analyzeImageForAI,
  getMediaAIAnalysis,
  reanalyzeMedia,
  markAsAIGenerated,
  getAIGeneratedImages,
  getAIDetectionStats,
  userDisclosesAI,
  getPostAIAnalysis,
};
