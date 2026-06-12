import Enterprise from '../models/Enterprise.js';
import User from '../models/User.js';
import Bot from '../models/Bot.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';
import crypto from 'crypto';

/**
 * Crear una nueva empresa
 */
export const createEnterprise = asyncHandler(async (req, res, next) => {
  const { name, email, description, website } = req.body;

  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Verificar si el usuario ya tiene una empresa
  const existingEnterprise = await Enterprise.findOne({ owner: req.user.userId });
  if (existingEnterprise) {
    return next(new AppError('Ya tienes una empresa registrada', HTTP_STATUS.BAD_REQUEST));
  }

  // Crear empresa con plan Free por defecto
  const enterprise = await Enterprise.create({
    name,
    email,
    description,
    website,
    owner: req.user.userId,
    members: [req.user.userId],
    admins: [req.user.userId],
    licenseType: 'Free',
    maxCommunities: 3,
    maxBots: 0, // Sin bots en plan Free
    paymentStatus: 'Pending'
  });

  // Actualizar el usuario para asociarlo con la empresa
  user.enterprise = enterprise._id;
  user.subType = 'Empresarial';
  await user.save();

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Enterprise created successfully',
    data: enterprise
  });
});

/**
 * Obtener información de una empresa
 */
export const getEnterprise = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;

  const enterprise = await Enterprise.findById(enterpriseId)
    .populate('owner', 'username email')
    .populate('members', 'username email')
    .populate('botsCreated', 'name isActive')
    .populate('communitiesCreated', 'name description');

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: enterprise
  });
});

/**
 * Actualizar información de una empresa
 */
export const updateEnterprise = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;
  const { name, description, website, logo } = req.body;

  const user = await User.findById(req.user.userId);
  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos
  const isOwner = enterprise.owner.toString() === req.user.userId;
  const isAdmin = enterprise.admins.includes(req.user.userId);

  if (!isOwner && !isAdmin) {
    return next(new AppError('No tienes permisos para actualizar esta empresa', HTTP_STATUS.FORBIDDEN));
  }

  // Actualizar campos
  if (name) enterprise.name = name;
  if (description) enterprise.description = description;
  if (website) enterprise.website = website;
  if (logo) enterprise.logo = logo;

  await enterprise.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Enterprise updated successfully',
    data: enterprise
  });
});

/**
 * Agregar un miembro a la empresa
 */
export const addMember = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;
  const { userId } = req.body;

  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos
  const isOwner = enterprise.owner.toString() === req.user.userId;
  const isAdmin = enterprise.admins.includes(req.user.userId);

  if (!isOwner && !isAdmin) {
    return next(new AppError('No tienes permisos para agregar miembros', HTTP_STATUS.FORBIDDEN));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Verificar si ya es miembro
  if (enterprise.members.includes(userId)) {
    return next(new AppError('El usuario ya es miembro de esta empresa', HTTP_STATUS.BAD_REQUEST));
  }

  // Agregar miembro
  enterprise.members.push(userId);
  user.enterprise = enterprise._id;
  user.subType = 'Empresarial';

  await Promise.all([enterprise.save(), user.save()]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Member added successfully',
    data: enterprise
  });
});

/**
 * Crear un nuevo bot en la empresa
 */
export const createBot = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;
  const { name, description, permissions } = req.body;

  const user = await User.findById(req.user.userId);
  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos
  if (!enterprise.members.includes(req.user.userId)) {
    return next(new AppError('No eres miembro de esta empresa', HTTP_STATUS.FORBIDDEN));
  }

  // Validar límite de bots
  const botsCreated = enterprise.botsCreated?.length || 0;
  const maxBots = enterprise.maxBots;

  if (botsCreated >= maxBots) {
    return next(new AppError(
      `Has alcanzado el límite de bots para tu empresa (${maxBots}). Actualiza tu plan para crear más bots.`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  // Generar token único para el bot
  const token = crypto.randomBytes(32).toString('hex');

  const bot = await Bot.create({
    name,
    description,
    creator: req.user.userId,
    enterprise: enterprise._id,
    token,
    permissions: permissions || [],
    isActive: true
  });

  // Agregar bot a la empresa
  enterprise.botsCreated.push(bot._id);
  user.botsCreated.push(bot._id);

  await Promise.all([enterprise.save(), user.save()]);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Bot created successfully',
    data: bot,
    botStats: {
      created: botsCreated + 1,
      max: maxBots
    }
  });
});

/**
 * Obtener todos los bots de una empresa
 */
export const getEnterpriseBots = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;

  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  const bots = await Bot.find({ enterprise: enterpriseId })
    .populate('creator', 'username email');

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: bots
  });
});

/**
 * Actualizar plan de suscripción de una empresa
 * (Esto normalmente se haría después del pago)
 */
export const upgradePlan = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;
  const { licenseType } = req.body;

  // Validar que sea un plan válido
  if (!['Free', 'Professional', 'Premium'].includes(licenseType)) {
    return next(new AppError('Invalid license type', HTTP_STATUS.BAD_REQUEST));
  }

  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validar permisos (solo el propietario)
  if (enterprise.owner.toString() !== req.user.userId) {
    return next(new AppError('Solo el propietario puede actualizar el plan', HTTP_STATUS.FORBIDDEN));
  }

  // Actualizar límites según el plan
  const planLimits = {
    Free: { maxCommunities: 3, maxBots: 0 },
    Professional: { maxCommunities: 50, maxBots: 10 },
    Premium: { maxCommunities: 100, maxBots: 100 }
  };

  const limits = planLimits[licenseType];

  enterprise.licenseType = licenseType;
  enterprise.maxCommunities = limits.maxCommunities;
  enterprise.maxBots = limits.maxBots;
  enterprise.paymentStatus = 'Active';

  // Establecer fecha de expiración (1 año desde ahora)
  if (licenseType !== 'Free') {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    enterprise.licenseExpiresAt = expiryDate;
  }

  await enterprise.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Plan upgraded successfully',
    data: enterprise
  });
});

/**
 * Obtener estadísticas de la empresa
 */
export const getEnterpriseStats = asyncHandler(async (req, res, next) => {
  const { enterpriseId } = req.params;

  const enterprise = await Enterprise.findById(enterpriseId);

  if (!enterprise) {
    return next(new AppError('Enterprise not found', HTTP_STATUS.NOT_FOUND));
  }

  const stats = {
    name: enterprise.name,
    licenseType: enterprise.licenseType,
    paymentStatus: enterprise.paymentStatus,
    members: {
      total: enterprise.members.length,
      admins: enterprise.admins.length
    },
    communities: {
      created: enterprise.communitiesCreated.length,
      max: enterprise.maxCommunities
    },
    bots: {
      created: enterprise.botsCreated.length,
      max: enterprise.maxBots
    },
    licenseExpiresAt: enterprise.licenseExpiresAt
  };

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats
  });
});

export default {
  createEnterprise,
  getEnterprise,
  updateEnterprise,
  addMember,
  createBot,
  getEnterpriseBots,
  upgradePlan,
  getEnterpriseStats
};
