import rateLimit from 'express-rate-limit';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests from this IP, please try again later.') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message
      });
    }
  });
};

export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many auth attempts, please try again later.');
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100);

export default createRateLimit;