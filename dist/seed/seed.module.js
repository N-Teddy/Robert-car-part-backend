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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const category_entity_1 = require("../entities/category.entity");
const vehicle_entity_1 = require("../entities/vehicle.entity");
const part_entity_1 = require("../entities/part.entity");
const user_seed_service_1 = require("./user-seed.service");
const category_seed_service_1 = require("./category-seed.service");
const vehicle_seed_service_1 = require("./vehicle-seed.service");
const part_seed_service_1 = require("./part-seed.service");
let SeedModule = class SeedModule {
    constructor(userSeedService, categorySeedService, vehicleSeedService, partSeedService) {
        this.userSeedService = userSeedService;
        this.categorySeedService = categorySeedService;
        this.vehicleSeedService = vehicleSeedService;
        this.partSeedService = partSeedService;
    }
    async onModuleInit() {
        await this.userSeedService.run();
        await this.vehicleSeedService.run();
    }
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, category_entity_1.Category, vehicle_entity_1.Vehicle, part_entity_1.Part])],
        providers: [
            user_seed_service_1.UserSeedService,
            category_seed_service_1.CategorySeedService,
            vehicle_seed_service_1.VehicleSeedService,
            part_seed_service_1.PartSeedService,
        ],
    }),
    __metadata("design:paramtypes", [user_seed_service_1.UserSeedService,
        category_seed_service_1.CategorySeedService,
        vehicle_seed_service_1.VehicleSeedService,
        part_seed_service_1.PartSeedService])
], SeedModule);
//# sourceMappingURL=seed.module.js.map