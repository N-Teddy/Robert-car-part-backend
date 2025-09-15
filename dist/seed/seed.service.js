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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const user_data_1 = require("./data/user.data");
let SeedService = SeedService_1 = class SeedService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        await this.seedUsers();
    }
    async seedUsers() {
        try {
            const result = { created: 0, skipped: 0 };
            for (const userData of user_data_1.SAMPLE_USERS) {
                const existingUser = await this.userRepository.findOne({
                    where: { email: userData.email },
                });
                if (existingUser) {
                    this.logger.log(`User ${userData.email} already exists. Skipping...`);
                    result.skipped++;
                    continue;
                }
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const user = this.userRepository.create({
                    ...userData,
                    password: hashedPassword,
                });
                await this.userRepository.save(user);
                result.created++;
            }
            this.logger.log(`Seed completed. Created: ${result.created}, Skipped: ${result.skipped}`);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to seed users', error.stack);
            throw error;
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map