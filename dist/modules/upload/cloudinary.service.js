"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadFile(file, entityType, entityId) {
        try {
            const fileName = `${entityType}-${entityId}-${Date.now()}`;
            const folder = `${this.configService.get('CLOUDINARY_FOLDER')}/${entityType.toLowerCase()}`;
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder,
                    public_id: fileName,
                    resource_type: 'auto',
                    transformation: [
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' },
                    ],
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else if (result) {
                        resolve(result);
                    }
                });
                uploadStream.end(file.buffer);
            });
            this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
            };
        }
        catch (error) {
            this.logger.error('Failed to upload file to Cloudinary', error);
            throw error;
        }
    }
    async deleteFile(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            if (result.result === 'ok') {
                this.logger.log(`File deleted from Cloudinary: ${publicId}`);
            }
            else {
                this.logger.warn(`Failed to delete file from Cloudinary: ${publicId}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to delete file from Cloudinary', error);
            throw error;
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map