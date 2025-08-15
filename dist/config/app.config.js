"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
}));
//# sourceMappingURL=app.config.js.map