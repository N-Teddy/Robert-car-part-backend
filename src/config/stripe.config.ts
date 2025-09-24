// src/config/stripe.config.ts
import { registerAs } from '@nestjs/config';

// Add STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET to your .env file
export default registerAs('stripe', () => ({
	apiKey: process.env.STRIPE_API_KEY,
	webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}));
