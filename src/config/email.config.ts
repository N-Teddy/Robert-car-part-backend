// src/config/email.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
    // For development, you can use Maildev. For production, use a real SMTP provider.
    host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.SMTP_HOST,
    port: process.env.NODE_ENV === 'development' ? 1025 : parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.NODE_ENV === 'development' ? false : (process.env.SMTP_SECURE === 'true'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    templateDir: process.env.EMAIL_TEMPLATE_DIR || 'src/templates/email',
    defaultFromName: process.env.DEFAULT_FROM_NAME || 'Car Parts Shop',
    defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || 'noreply@carpartsshop.com',
}));