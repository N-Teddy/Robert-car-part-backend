// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.cofig';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Prefix all routes with /api
	app.setGlobalPrefix('api');

	// Enable CORS
	app.enableCors({
		origin: [
			'http://localhost:5173', // Vite dev server
			'http://localhost:3000', // Local frontend
			'https://robert-car-part-backend.vercel.app', // Your Vercel domain
		],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTION',
	});

	// Swagger Setup
	setupSwagger(app);

	await app.listen(configService.get<number>('PORT', 3000), '0.0.0.0');
	console.log('Swagger Doc: http://localhost:3000/api/docs');
	console.log('API : http://localhost:3000/api/');
	console.log('WebSocket : ws://localhost:3000/notifications');
}
bootstrap();
