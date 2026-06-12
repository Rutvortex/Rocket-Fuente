import User from '../models/User.js';
import Enterprise from '../models/Enterprise.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware para validar si el usuario puede crear una nueva comunidad/grupo
 */
export const validateCommunityLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  let maxCommunities = 3; // Límite por defecto para usuarios Free
  let communitiesCreated = user.communitiesCreated?.length || 0;
  let extraSpacesFromAchievements = 0;

  // Si el usuario tiene suscripción Premium
  if (user.subscriptionPlan === 'Premium') {
    maxCommunities = 100;
  }

  // Si el usuario es miembro de una empresa
  if (user.enterprise) {
    const enterprise = await Enterprise.findById(user.enterprise);
    if (enterprise) {
      maxCommunities = enterprise.maxCommunities;
      communitiesCreated = enterprise.communitiesCreated?.length || 0;
    }
  }

  // Agregar espacios extra por logros desbloqueados
  if (user.achievementsUnlocked && user.achievementsUnlocked.length > 0) {
    const Achievement = require('../models/Achievement.js').default;
    const achievements = await Achievement.find({ _id: { $in: user.achievementsUnlocked } });
    extraSpacesFromAchievements = achievements.reduce((total, ach) => total + ach.communitySpacesReward, 0);
  }

  const totalAvailable = maxCommunities + extraSpacesFromAchievements;

  // Validar límite
  if (communitiesCreated >= totalAvailable) {
    return next(new AppError(
      `Has alcanzado el límite de comunidades (${totalAvailable}). Actualiza a Premium o desbloquea logros para obtener más espacios.`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  // Pasar información al controlador
  req.communityLimit = {
    max: totalAvailable,
    current: communitiesCreated,
    canCreate: true
  };

  next();
});

/**
 * Middleware para validar si el usuario/empresa puede crear un nuevo bot
 */
export const validateBotLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Los usuarios normales no pueden crear bots
  if (!user.enterprise) {
    return next(new AppError('Solo las empresas pueden crear bots', HTTP_STATUS.FORBIDDEN));
  }

  const enterprise = await Enterprise.findById(user.enterprise);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  const botsCreated = enterprise.botsCreated?.length || 0;
  const maxBots = enterprise.maxBots;

  // Free: 0 bots
  // Professional: 10 bots
  // Premium: 100 bots
  if (botsCreated >= maxBots) {
    return next(new AppError(
      `Has alcanzado el límite de bots para tu empresa (${maxBots}). Actualiza tu plan para crear más bots.`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  req.botLimit = {
    max: maxBots,
    current: botsCreated,
    canCreate: true
  };

  next();
});

/**
 * Middleware para validar si el usuario es propietario/admin de una empresa
 */
export const validateEnterpriseOwner = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  const isOwner = enterprise.owner.toString() === req.user.userId;
  const isAdmin = enterprise.admins.includes(req.user.userId);

  if (!isOwner && !isAdmin) {
    return next(new AppError('No tienes permisos para gestionar esta empresa', HTTP_STATUS.FORBIDDEN));
  }

  req.enterprise = enterprise;
  next();
});

export default {
  validateCommunityLimit,
  validateBotLimit,
  validateEnterpriseOwner
};
