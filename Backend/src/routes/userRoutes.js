import { Router } from 'express';
import { getProfile, updateProfile, followUser } from '../controllers/userController.js';
import authenticate from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { updateProfileValidation, userIdValidation } from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.route('/profile')
  .get(getProfile)
  .put(updateProfileValidation, validate, updateProfile);

router.route('/:id/follow')
  .post(userIdValidation, validate, followUser);

router.get('/:id', userIdValidation, validate, getProfile);

export default router;