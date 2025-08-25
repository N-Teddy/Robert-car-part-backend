"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('email', () => ({
    host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.SMTP_HOST,
    port: process.env.NODE_ENV === 'development' ? 1025 : parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.NODE_ENV === 'development' ? false : (process.env.SMTP_SECURE === 'true'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    templateDir: 'templates/email',
    defaultFromName: process.env.DEFAULT_FROM_NAME || 'Car Parts Shop',
    defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || 'noreply@carpartsshop.com',
}));
//# sourceMappingURL=email.config.js.map