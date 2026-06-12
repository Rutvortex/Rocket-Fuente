import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

/**
 * Crear un nuevo logro (solo para administradores)
 */
export const createAchievement = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  // Validar que sea administrador
  if (!user || !user.isAdmin) {
    return next(new AppError('Solo administradores pueden crear logros', HTTP_STATUS.FORBIDDEN));
  }

  const { name, description, icon, requiredAction, requiredCount, communitySpacesReward, botSpacesReward, badge } = req.body;

  const achievement = await Achievement.create({
    name,
    description,
    icon,
    requiredAction,
    requiredCount,
    communitySpacesReward: communitySpacesReward || 0,
    botSpacesReward: botSpacesReward || 0,
    badge
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Achievement created successfully',
    data: achievement
  });
});

/**
 * Obtener todos los logros disponibles
 */
export const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find().sort({ createdAt: -1 });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: achievements
  });
});

/**
 * Obtener logros desbloqueados de un usuario
 */
export const getUserAchievements = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate('achievementsUnlocked');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user.achievementsUnlocked || []
  });
});

/**
 * Desbloquear un logro para un usuario
 * (Normalmente se llamaría automáticamente cuando el usuario cumple los requisitos)
 */
export const unlockAchievement = asyncHandler(async (req, res, next) => {
  const { userId, achievementId } = req.body;

  const user = await User.findById(userId);
  const achievement = await Achievement.findById(achievementId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  if (!achievement) {
    return next(new AppError('Achievement not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar que el usuario no haya desbloqueado ya este logro
  if (user.achievementsUnlocked.includes(achievementId)) {
    return next(new AppError('Achievement already unlocked', HTTP_STATUS.BAD_REQUEST));
  }

  // Desbloquear el logro
  user.achievementsUnlocked.push(achievementId);

  // Agregar badge si existe
  if (achievement.badge) {
    user.badges.push(achievement.badge);
  }

  await user.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Achievement unlocked!',
    data: {
      achievement,
      user: {
        id: user._id,
        badges: user.badges,
        achievementsUnlocked: user.achievementsUnlocked
      }
    }
  });
});

/**
 * Verificar y desbloquear logros automáticamente basado en acciones del usuario
 */
export const checkAndUnlockAchievements = asyncHandler(async (userId, actionType, actionCount = 1) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Buscar logros que coincidan con la acción
  const matchingAchievements = await Achievement.find({
    requiredAction: actionType,
    _id: { $nin: user.achievementsUnlocked } // Que no estén ya desbloqueados
  });

  const unlockedAchievements = [];

  for (const achievement of matchingAchievements) {
    // Obtener el contador actual del usuario
    let currentCount = 0;

    switch (actionType) {
      case 'posts':
        // Aquí iría la lógica para contar posts del usuario
        // currentCount = await Post.countDocuments({ creator: userId });
        break;
      case 'followers':
        currentCount = user.followers.length;
        break;
      case 'communities':
        currentCount = user.communitiesCreated.length;
        break;
      case 'engagement':
        // Aquí iría la lógica para calcular engagement
        break;
      case 'consecutive_days':
        // Aquí iría la lógica para verificar días consecutivos
        break;
    }

    // Si el usuario alcanzó el requisito, desbloquear el logro
    if (currentCount >= achievement.requiredCount) {
      user.achievementsUnlocked.push(achievement._id);

      if (achievement.badge) {
        user.badges.push(achievement.badge);
      }

      unlockedAchievements.push(achievement);
    }
  }

  if (unlockedAchievements.length > 0) {
    await user.save();
  }

  return unlockedAchievements;
});

/**
 * Obtener estadísticas de logros de un usuario
 */
export const getUserAchievementStats = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate('achievementsUnlocked');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const achievements = user.achievementsUnlocked || [];

  const stats = {
    totalUnlocked: achievements.length,
    totalCommunitySpaces: achievements.reduce((total, ach) => total + (ach.communitySpacesReward || 0), 0),
    totalBotSpaces: achievements.reduce((total, ach) => total + (ach.botSpacesReward || 0), 0),
    badges: user.badges,
    achievements: achievements
  };

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats
  });
});

export default {
  createAchievement,
  getAchievements,
  getUserAchievements,
  unlockAchievement,
  checkAndUnlockAchievements,
  getUserAchievementStats
};
