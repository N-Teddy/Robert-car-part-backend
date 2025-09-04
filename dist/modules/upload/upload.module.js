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
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const upload_controller_1 = require("./upload.controller");
const upload_service_1 = require("./upload.service");
const image_entity_1 = require("../../entities/image.entity");
const cloudinary_service_1 = require("./cloudinary.service");
const local_storage_service_1 = require("./local-storage.service");
const static_file_middleware_1 = require("./static-file.middleware");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../entities/user.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const part_entity_1 = require("../../entities/part.entity");
const fs_1 = require("fs");
const path_1 = require("path");
let UploadModule = class UploadModule {
    configure(consumer) {
        consumer
            .apply(static_file_middleware_1.StaticFileMiddleware)
            .forRoutes({ path: 'uploads/*', method: common_1.RequestMethod.GET });
    }
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    return {
                        storage: (0, multer_1.diskStorage)({
                            destination: (req, file, cb) => {
                                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'temp');
                                if (!(0, fs_1.existsSync)(uploadPath)) {
                                    (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                                }
                                cb(null, uploadPath);
                            },
                            filename: (req, file, cb) => {
                                const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
                                cb(null, uniqueName);
                            },
                        }),
                        limits: {
                            fileSize: 5 * 1024 * 1024,
                        },
                    };
                },
            }),
            typeorm_1.TypeOrmModule.forFeature([image_entity_1.Image, user_entity_1.User, vehicle_entity_1.Vehicle, part_entity_1.Part]),
        ],
        controllers: [upload_controller_1.UploadController],
        providers: [upload_service_1.UploadService, cloudinary_service_1.CloudinaryService, local_storage_service_1.LocalStorageService],
        exports: [upload_service_1.UploadService],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map