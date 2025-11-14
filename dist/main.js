"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const swagger_cofig_1 = require("./config/swagger.cofig");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://robert-car-part-backend.vercel.app',
            'https://robert-car-part-frontend.vercel.app',
            'tauri://localhost',
            'https://tauri.localhost'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTION',
    });
    (0, swagger_cofig_1.setupSwagger)(app);
    await app.listen(configService.get('PORT', 3000));
    console.log('Swagger Doc: http://localhost:3000/api/docs');
    console.log('API : http://localhost:3000/api/');
    console.log('WebSocket : ws://localhost:3000/notifications');
}
bootstrap();
//# sourceMappingURL=main.js.map