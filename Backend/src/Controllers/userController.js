import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id || req.user.userId)
    .populate('followers', 'username profilePicture')
    .populate('following', 'username profilePicture')
    .populate('groups', 'name description');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user.toJSON()
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const { username, bio, profilePicture } = req.body;
  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;
  if (profilePicture) user.profilePicture = profilePicture;

  await user.save();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: user.toJSON()
  });
});

export const followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.userId);

  if (!userToFollow) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  if (req.params.id === req.user.userId) {
    return next(new AppError('Cannot follow yourself', HTTP_STATUS.BAD_REQUEST));
  }

  const isFollowing = currentUser.following.includes(req.params.id);

  if (isFollowing) {
    currentUser.following.pull(req.params.id);
    userToFollow.followers.pull(req.user.userId);
  } else {
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.userId);
  }

  await Promise.all([currentUser.save(), userToFollow.save()]);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: isFollowing ? 'Unfollowed user' : 'Followed user'
  });
});