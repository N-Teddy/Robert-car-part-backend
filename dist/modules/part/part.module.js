"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const part_entity_1 = require("../../entities/part.entity");
const vehicle_entity_1 = require("../../entities/vehicle.entity");
const category_entity_1 = require("../../entities/category.entity");
const qr_code_entity_1 = require("../../entities/qr-code.entity");
const image_entity_1 = require("../../entities/image.entity");
const part_service_1 = require("./part.service");
const part_controller_1 = require("./part.controller");
const upload_module_1 = require("../upload/upload.module");
const notification_module_1 = require("../notification/notification.module");
let PartModule = class PartModule {
};
exports.PartModule = PartModule;
exports.PartModule = PartModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([part_entity_1.Part, vehicle_entity_1.Vehicle, category_entity_1.Category, qr_code_entity_1.QrCode, image_entity_1.Image]),
            upload_module_1.UploadModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [part_controller_1.PartController],
        providers: [part_service_1.PartService],
        exports: [part_service_1.PartService],
    })
], PartModule);
//# sourceMappingURL=part.module.js.map