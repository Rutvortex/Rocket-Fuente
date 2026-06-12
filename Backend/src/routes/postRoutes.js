import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost
} from '../controllers/postController.js';
import authenticate from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import {
  createPostValidation,
  updatePostValidation,
  postIdValidation,
  listPostsValidation
} from '../validators/postValidators.js';

const router = Router();

router.route('/')
  .get(listPostsValidation, validate, getPosts)
  .post(authenticate, createPostValidation, validate, createPost);

router.route('/:id')
  .get(postIdValidation, validate, getPostById)
  .put(authenticate, updatePostValidation, validate, updatePost)
  .delete(authenticate, postIdValidation, validate, deletePost);

router.post('/:id/like', authenticate, postIdValidation, validate, likePost);

export default router;