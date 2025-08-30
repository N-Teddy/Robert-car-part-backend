"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticFileMiddleware = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
let StaticFileMiddleware = class StaticFileMiddleware {
    use(req, res, next) {
        if (req.path.startsWith('/uploads/')) {
            const filePath = (0, path_1.join)(process.cwd(), req.path);
            if ((0, fs_1.existsSync)(filePath)) {
                const stat = (0, fs_1.statSync)(filePath);
                if (stat.isFile()) {
                    res.setHeader('Content-Type', this.getMimeType(filePath));
                    res.setHeader('Content-Length', stat.size);
                    res.setHeader('Cache-Control', 'public, max-age=31536000');
                    const stream = (0, fs_1.createReadStream)(filePath);
                    stream.pipe(res);
                    return;
                }
            }
            res.status(404).json({ message: 'File not found' });
            return;
        }
        next();
    }
    getMimeType(filePath) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.StaticFileMiddleware = StaticFileMiddleware;
exports.StaticFileMiddleware = StaticFileMiddleware = __decorate([
    (0, common_1.Injectable)()
], StaticFileMiddleware);
//# sourceMappingURL=static-file.middleware.js.map