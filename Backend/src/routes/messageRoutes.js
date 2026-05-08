import { Router } from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/messageController.js';
import authenticate from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { sendMessageValidation, userIdValidation } from '../validators/messageValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', sendMessageValidation, validate, sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', userIdValidation, validate, getMessages);

export default router;