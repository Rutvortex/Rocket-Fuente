import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, bio, userType, subType } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError('Email or username already in use', HTTP_STATUS.BAD_REQUEST));
  }

  const user = await User.create({ username, email, password, bio, userType, subType });
  const token = signToken(user);
  const refreshToken = signRefreshToken(user);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: { user: user.toJSON(), token, refreshToken }
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  const token = signToken(user);
  const refreshToken = signRefreshToken(user);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data: { user: user.toJSON(), token, refreshToken }
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token required', HTTP_STATUS.BAD_REQUEST));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
    }

    const newToken = signToken(user);
    const newRefreshToken = signRefreshToken(user);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED));
  }
});