import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Missing or invalid auth token', HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, email: payload.email };
    return next();
  } catch (_error) {
    return next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
};

export default authenticate;