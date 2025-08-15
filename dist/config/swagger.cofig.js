"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const configService = app.get(config_1.ConfigService);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle(configService.get('APP_NAME', 'API Documentation'))
        .setDescription(`${configService.get('APP_NAME')} Endpoints`)
        .setVersion(configService.get('APP_VERSION', '1.0.0'))
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}
//# sourceMappingURL=swagger.cofig.js.map