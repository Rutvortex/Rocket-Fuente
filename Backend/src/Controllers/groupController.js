import Group from '../models/Group.js';
import User from '../models/User.js';
import Enterprise from '../models/Enterprise.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const createGroup = asyncHandler(async (req, res, next) => {
  const { name, description, isPrivate, category, memberLimit, audienceType, regionConstraint } = req.body;
  
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Las cuentas infantiles no pueden crear comunidades
  if (user.subType === 'Infantil') {
    return next(new AppError('Las cuentas infantiles no tienen permisos para crear comunidades.', HTTP_STATUS.FORBIDDEN));
  }

  // Validar límite de comunidades
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
    const Achievement = (await import('../models/Achievement.js')).default;
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

  const group = await Group.create({
    name,
    description,
    creator: req.user.userId,
    members: [req.user.userId],
    admins: [req.user.userId],
    isPrivate,
    category,
    type: 'community',
    enterprise: user.enterprise || null,
    memberLimit: memberLimit || 0,
    audienceType: audienceType || 'Normal',
    regionConstraint: regionConstraint || 'Mundial'
  });

  // Agregar grupo a la lista de comunidades creadas por el usuario
  user.communitiesCreated.push(group._id);
  await user.save();

  // Si el usuario es parte de una empresa, agregar también a la empresa
  if (user.enterprise) {
    await Enterprise.findByIdAndUpdate(
      user.enterprise,
      { $push: { communitiesCreated: group._id } },
      { new: true }
    );
  }

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Group created successfully',
    data: group,
    communityStats: {
      created: communitiesCreated + 1,
      max: totalAvailable
    }
  });
});

export const getGroups = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = { type: 'community' };
  if (req.query.joined === 'true') {
    filters.members = req.user.userId;
  } else {
    filters.isPrivate = false; // Solo comunidades públicas por defecto
  }

  const [groups, total] = await Promise.all([
    Group.find(filters)
      .populate('creator', 'username profilePicture')
      .populate('enterprise', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Group.countDocuments(filters)
  ]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: groups,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

export const joinGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(new AppError('Group not found', HTTP_STATUS.NOT_FOUND));
  }

  if (group.members.includes(req.user.userId)) {
    return next(new AppError('Already a member', HTTP_STATUS.BAD_REQUEST));
  }

  group.members.push(req.user.userId);
  await group.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Joined group successfully'
  });
});