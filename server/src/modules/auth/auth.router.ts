import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.get('/me', authenticateToken, AuthController.getProfile);
