import { Router } from 'express';
import { login, register, refreshToken } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import { loginValidation, registerValidation } from '../validators/authValidators.js';
import { authRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/register', authRateLimit, registerValidation, validate, register);
router.post('/login', authRateLimit, loginValidation, validate, login);
router.post('/refresh', refreshToken);

export default router;