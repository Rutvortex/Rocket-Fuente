import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  console.debug('authMiddleware - Authorization header:', authHeader);

  if (!token) {
    return next(new AppError('Missing or invalid auth token', HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.debug('authMiddleware - JWT payload:', payload);
    req.user = { userId: payload.userId, email: payload.email };
    return next();
  } catch (error) {
    console.error('authMiddleware - token verify error:', error);
    return next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
};

export default authenticate;