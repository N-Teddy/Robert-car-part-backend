"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('auth', () => ({
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10),
}));
//# sourceMappingURL=auth.config.js.map