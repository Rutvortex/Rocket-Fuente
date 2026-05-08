import Group from '../models/Group.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, isPrivate, category } = req.body;

  const group = await Group.create({
    name,
    description,
    creator: req.user.userId,
    members: [req.user.userId],
    admins: [req.user.userId],
    isPrivate,
    category
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Group created successfully',
    data: group
  });
});

export const getGroups = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = { isPrivate: false }; // Solo grupos públicos por defecto

  const [groups, total] = await Promise.all([
    Group.find(filters)
      .populate('creator', 'username profilePicture')
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

  // Agregar grupo a usuario
  const user = await User.findById(req.user.userId);
  user.groups.push(group._id);
  await user.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Joined group successfully'
  });
});