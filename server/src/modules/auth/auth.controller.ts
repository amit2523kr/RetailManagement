import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { asyncHandler, BadRequestError } from '../../utils/errors.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new BadRequestError('Invalid login inputs', parseResult.error.flatten());
    }

    const { email, password } = parseResult.data;
    const result = await AuthService.login(email, password);
    return sendSuccess(res, result, 'Login successful');
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await AuthService.getProfile(userId);
    return sendSuccess(res, profile, 'User profile fetched');
  });
}
