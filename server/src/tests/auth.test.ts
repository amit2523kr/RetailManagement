import { describe, it, expect } from 'vitest';
import { AuthService } from '../modules/auth/auth.service.js';

describe('Auth Module Unit Tests', () => {
  it('should define AuthService login and getProfile methods', () => {
    expect(AuthService.login).toBeDefined();
    expect(AuthService.getProfile).toBeDefined();
  });
});
