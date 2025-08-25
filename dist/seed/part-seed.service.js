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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PartSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const part_entity_1 = require("../entities/part.entity");
const vehicle_entity_1 = require("../entities/vehicle.entity");
const category_entity_1 = require("../entities/category.entity");
const parts_data_1 = require("./data/parts.data");
let PartSeedService = PartSeedService_1 = class PartSeedService {
    constructor(partRepository, vehicleRepository, categoryRepository) {
        this.partRepository = partRepository;
        this.vehicleRepository = vehicleRepository;
        this.categoryRepository = categoryRepository;
        this.logger = new common_1.Logger(PartSeedService_1.name);
    }
    async run() {
        for (const seed of parts_data_1.seedPartsData) {
            const vehicle = await this.vehicleRepository.findOne({ where: { vin: seed.vehicleVin } });
            const category = await this.categoryRepository.findOne({ where: { name: seed.categoryName } });
            if (!vehicle || !category) {
                this.logger.warn(`Skipping part ${seed.partNumber}: missing vehicle or category`);
                continue;
            }
            const existing = await this.partRepository.findOne({ where: { partNumber: seed.partNumber } });
            const payload = {
                name: seed.name,
                description: seed.description,
                price: seed.price,
                quantity: seed.quantity,
                condition: seed.condition,
                partNumber: seed.partNumber,
                isFeatured: seed.isFeatured,
                vehicle,
                category,
            };
            if (existing) {
                await this.partRepository.update({ id: existing.id }, payload);
            }
            else {
                const created = this.partRepository.create(payload);
                await this.partRepository.save(created);
            }
        }
    }
};
exports.PartSeedService = PartSeedService;
exports.PartSeedService = PartSeedService = PartSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(part_entity_1.Part)),
    __param(1, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PartSeedService);
//# sourceMappingURL=part-seed.service.js.map