import { body, param } from 'express-validator';

export const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  body('category')
    .optional()
    .isIn(['Arte', 'Música', 'Fotografía', 'Diseño', 'Otro'])
    .withMessage('Invalid category')
];

export const groupIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid group ID')
];