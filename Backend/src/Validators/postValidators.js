import { body, param, query } from 'express-validator';

export const createPostValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 2000 })
    .withMessage('Content must not exceed 2000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

export const updatePostValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Content must not exceed 2000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters')
];

export const postIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid post ID')
];

export const listPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
];