"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const serve_static_1 = require("@nestjs/serve-static");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const upload_controller_1 = require("./upload.controller");
const upload_service_1 = require("./upload.service");
const local_storage_service_1 = require("./local-storage.service");
const cloudinary_service_1 = require("./cloudinary.service");
const image_entity_1 = require("../../entities/image.entity");
const user_entity_1 = require("../../entities/user.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const part_entity_1 = require("../../entities/part.entity");
const category_entity_1 = require("../../entities/category.entity");
const qr_code_entity_1 = require("../../entities/qr-code.entity");
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                image_entity_1.Image,
                user_entity_1.User,
                vehicle_entity_1.Vehicle,
                part_entity_1.Part,
                category_entity_1.Category,
                qr_code_entity_1.QrCode,
            ]),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    limits: {
                        fileSize: configService.get('MAX_FILE_SIZE') || 10485760,
                    },
                    storage: configService.get('NODE_ENV') === 'production'
                        ? undefined
                        : undefined,
                }),
                inject: [config_1.ConfigService],
            }),
            serve_static_1.ServeStaticModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
                    if (!isProduction && !isServerless) {
                        return [
                            {
                                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                                serveRoot: '/uploads',
                                serveStaticOptions: {
                                    index: false,
                                    fallthrough: false,
                                },
                            },
                        ];
                    }
                    return [];
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [upload_controller_1.UploadController],
        providers: [
            upload_service_1.UploadService,
            {
                provide: 'STORAGE_SERVICE',
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
                    if (isProduction || isServerless) {
                        return new cloudinary_service_1.CloudinaryService(configService);
                    }
                    else {
                        return new local_storage_service_1.LocalStorageService(configService);
                    }
                },
                inject: [config_1.ConfigService],
            },
            local_storage_service_1.LocalStorageService,
            cloudinary_service_1.CloudinaryService,
        ],
        exports: [upload_service_1.UploadService],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map