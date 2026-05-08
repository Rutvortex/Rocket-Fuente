import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map((err) => `${err.path}: ${err.msg}`).join(', ');
  return next(new AppError(`Validation error - ${details}`, HTTP_STATUS.UNPROCESSABLE_ENTITY));
};

export default validate;