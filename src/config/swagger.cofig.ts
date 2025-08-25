// src/config/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

export function setupSwagger(app: INestApplication) {
    const configService = app.get(ConfigService);

    const swaggerConfig = new DocumentBuilder()
        .setTitle(configService.get<string>('APP_NAME', 'API Documentation'))
        .setDescription(`${configService.get<string>('APP_NAME')} Endpoints`)
        .setVersion(configService.get<string>('APP_VERSION', '1.0.0'))
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // Replace the default Swagger setup with custom setup
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
        customCssUrl: CSS_URL,
    }));

    // Optional: You can keep both setups if you want, but typically you'd use one
    // SwaggerModule.setup('api/docs', app, document, {
    //     swaggerOptions: {
    //         persistAuthorization: true,
    //     },
    // });
}