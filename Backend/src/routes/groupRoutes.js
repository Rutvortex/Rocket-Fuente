import { Router } from 'express';
import { createGroup, getGroups, joinGroup } from '../controllers/groupController.js';
import { getGroupMessages, sendGroupMessage } from '../controllers/groupMessageController.js';
import authenticate from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createGroupValidation, groupIdValidation } from '../validators/groupValidators.js';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getGroups)
  .post(createGroupValidation, validate, createGroup);

router.post('/:id/join', groupIdValidation, validate, joinGroup);

// Group messages
router.get('/:id/messages', groupIdValidation, validate, getGroupMessages);
router.post('/:id/messages', groupIdValidation, validate, sendGroupMessage);

export default router;