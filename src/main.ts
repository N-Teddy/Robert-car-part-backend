// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
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
		origin: configService.get<string[]>('app.corsOrigin', ['*']),
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	});

	// Swagger Setup
	setupSwagger(app);

	await app.listen(configService.get<number>('PORT', 3000));
	console.log('Swagger Doc: http://localhost:3000/api/docs');
	console.log('API : http://localhost:3000/api/');
	console.log('WebSocket : ws://localhost:3000/notifications');
}
bootstrap();
