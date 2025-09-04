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
            cloud_name: this.configService.get('cloudinary.cloudName'),
            api_key: this.configService.get('cloudinary.apiKey'),
            api_secret: this.configService.get('cloudinary.apiSecret'),
        });
    }
    getFolderNameFromImageType(imageType) {
        return imageType.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
    }
    async uploadImage(file, imageType) {
        try {
            const base64Image = file.buffer.toString('base64');
            const dataURI = `data:${file.mimetype};base64,${base64Image}`;
            const folderName = this.getFolderNameFromImageType(imageType);
            const uploadFolder = `car-parts-shop/${folderName}`;
            const result = await cloudinary_1.v2.uploader.upload(dataURI, {
                folder: uploadFolder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            });
            this.logger.log(`Image uploaded to Cloudinary: ${result.public_id}`);
            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload image to Cloudinary: ${error.message}`);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }
    async deleteImage(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
            this.logger.log(`Image deleted from Cloudinary: ${publicId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete image from Cloudinary: ${error.message}`);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }
    async updateImage(publicId, file, imageType) {
        try {
            await this.deleteImage(publicId);
            const result = await this.uploadImage(file, imageType);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update image in Cloudinary: ${error.message}`);
            throw new Error(`Failed to update image: ${error.message}`);
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map