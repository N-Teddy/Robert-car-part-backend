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
const fs_1 = require("fs");
const path_1 = require("path");
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LocalStorageService_1.name);
        this.uploadsDir = './uploads';
        this.ensureUploadsDirectory();
    }
    async ensureUploadsDirectory() {
        try {
            await fs_1.promises.access(this.uploadsDir);
        }
        catch {
            await fs_1.promises.mkdir(this.uploadsDir, { recursive: true });
            this.logger.log('Created uploads directory');
        }
    }
    getFolderNameFromImageType(imageType) {
        return imageType.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
    }
    generateFileName(file, imageType) {
        const typePart = this.getFolderNameFromImageType(imageType);
        const timestamp = Date.now();
        const extension = this.getFileExtension(file.originalname);
        return `${typePart}-${timestamp}${extension}`;
    }
    async uploadImage(file, imageType) {
        try {
            const folderName = this.getFolderNameFromImageType(imageType);
            const typeDir = (0, path_1.join)(this.uploadsDir, folderName);
            await fs_1.promises.mkdir(typeDir, { recursive: true });
            const fileName = this.generateFileName(file, imageType);
            const filePath = (0, path_1.join)(typeDir, fileName);
            if (!file.path) {
                throw new Error('File path not found - disk storage expected');
            }
            await fs_1.promises.rename(file.path, filePath);
            this.logger.log(`File moved from ${file.path} to ${filePath}`);
            const url = this.getPublicUrl(filePath);
            this.logger.log(`Image stored locally: ${filePath}`);
            return {
                url,
                localPath: filePath,
                filename: fileName,
            };
        }
        catch (error) {
            this.logger.error(`Failed to store image locally: ${error}`);
            if (file.path) {
                await fs_1.promises.unlink(file.path).catch(cleanupError => {
                    this.logger.warn(`Failed to cleanup temp file: ${cleanupError.message}`);
                });
            }
            throw new Error(`Failed to store image: ${error.message}`);
        }
    }
    async deleteImage(localPath) {
        try {
            await fs_1.promises.unlink(localPath);
            this.logger.log(`Image deleted locally: ${localPath}`);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logger.error(`Failed to delete local image: ${error.message}`);
                throw new Error(`Failed to delete image: ${error.message}`);
            }
            this.logger.warn(`Image already deleted: ${localPath}`);
        }
    }
    async updateImage(oldLocalPath, file, imageType) {
        try {
            if (oldLocalPath) {
                await this.deleteImage(oldLocalPath).catch(error => {
                    this.logger.warn(`Failed to delete old image: ${error.message}`);
                });
            }
            const result = await this.uploadImage(file, imageType);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update local image: ${error.message}`);
            throw new Error(`Failed to update image: ${error.message}`);
        }
    }
    getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1)
            return '';
        return filename.slice(lastDotIndex);
    }
    getPublicUrl(localPath) {
        const relativePath = localPath.replace(this.uploadsDir, '').replace(/\\/g, '/');
        const baseUrl = this.configService.get('app.baseUrl') || 'http://localhost:3000';
        return `${baseUrl}/uploads${relativePath}`;
    }
    async getImageStats() {
        try {
            const stats = await this.getDirectoryStats(this.uploadsDir);
            return stats;
        }
        catch (error) {
            this.logger.error(`Failed to get image stats: ${error.message}`);
            return { totalFiles: 0, totalSize: 0, typeBreakdown: {} };
        }
    }
    async getDirectoryStats(dirPath) {
        let totalFiles = 0;
        let totalSize = 0;
        const typeBreakdown = {};
        try {
            const items = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
            for (const item of items) {
                const fullPath = (0, path_1.join)(dirPath, item.name);
                if (item.isDirectory()) {
                    const subStats = await this.getDirectoryStats(fullPath);
                    totalFiles += subStats.totalFiles;
                    totalSize += subStats.totalSize;
                    const typeName = item.name;
                    typeBreakdown[typeName] =
                        (typeBreakdown[typeName] || 0) + subStats.totalFiles;
                }
                else if (item.isFile()) {
                    totalFiles++;
                    const fileStats = await fs_1.promises.stat(fullPath);
                    totalSize += fileStats.size;
                }
            }
        }
        catch (error) {
            this.logger.debug(`Directory ${dirPath} not accessible: ${error.message}`);
        }
        return { totalFiles, totalSize, typeBreakdown };
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map