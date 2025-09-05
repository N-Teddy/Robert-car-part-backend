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
var LocalStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const entity_enum_1 = require("../../common/enum/entity.enum");
const unlinkAsync = (0, util_1.promisify)(fs.unlink);
const mkdirAsync = (0, util_1.promisify)(fs.mkdir);
const existsAsync = (0, util_1.promisify)(fs.exists);
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LocalStorageService_1.name);
        this.uploadPath = path.join(process.cwd(), 'uploads');
        this.baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
        this.ensureUploadDirectories();
    }
    async ensureUploadDirectories() {
        try {
            if (!fs.existsSync(this.uploadPath)) {
                await mkdirAsync(this.uploadPath, { recursive: true });
            }
            for (const entityType of Object.values(entity_enum_1.ImageEnum)) {
                const subfolderPath = path.join(this.uploadPath, entityType.toLowerCase());
                if (!fs.existsSync(subfolderPath)) {
                    await mkdirAsync(subfolderPath, { recursive: true });
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to create upload directories', error);
        }
    }
    async uploadFile(file, entityType, entityId) {
        try {
            const fileExtension = path.extname(file.originalname);
            const fileName = `${entityType}-${entityId}-${Date.now()}${fileExtension}`;
            const subfolder = entityType.toLowerCase();
            const filePath = path.join(this.uploadPath, subfolder, fileName);
            await fs.promises.writeFile(filePath, file.buffer);
            const url = `${this.baseUrl}/uploads/${subfolder}/${fileName}`;
            this.logger.log(`File uploaded locally: ${url}`);
            return {
                url,
                publicId: `${subfolder}/${fileName}`,
                format: fileExtension.replace('.', ''),
                size: file.size,
            };
        }
        catch (error) {
            this.logger.error('Failed to upload file locally', error);
            throw error;
        }
    }
    async deleteFile(publicId) {
        try {
            const filePath = path.join(this.uploadPath, publicId);
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
                this.logger.log(`File deleted locally: ${publicId}`);
            }
            else {
                this.logger.warn(`File not found for deletion: ${publicId}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to delete file locally', error);
            throw error;
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map