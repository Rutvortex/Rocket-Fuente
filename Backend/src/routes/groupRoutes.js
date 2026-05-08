import { Router } from 'express';
import { createGroup, getGroups, joinGroup } from '../controllers/groupController.js';
import authenticate from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createGroupValidation, groupIdValidation } from '../validators/groupValidators.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getGroups)
  .post(createGroupValidation, validate, createGroup);

router.post('/:id/join', groupIdValidation, validate, joinGroup);

export default router;