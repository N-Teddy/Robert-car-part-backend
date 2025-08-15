// src/config/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
    const configService = app.get(ConfigService);

    const swaggerConfig = new DocumentBuilder()
        .setTitle(configService.get<string>('APP_NAME', 'API Documentation'))
        .setDescription(`${configService.get<string>('APP_NAME')} Endpoints`)
        .setVersion(configService.get<string>('APP_VERSION', '1.0.0'))
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}
