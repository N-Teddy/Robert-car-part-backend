// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10), // 15 minutes
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10), // 30 minutes
}));