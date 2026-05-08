import { body, param } from 'express-validator';

export const sendMessageValidation = [
  body('receiver')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters')
];

export const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];