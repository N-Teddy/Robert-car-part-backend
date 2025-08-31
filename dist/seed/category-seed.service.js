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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../entities/category.entity");
const categories_data_1 = require("./data/categories.data");
let CategorySeedService = class CategorySeedService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async run() {
        const treeRepo = this.categoryRepository.manager.getTreeRepository(category_entity_1.Category);
        let root = await this.categoryRepository.findOne({
            where: { name: 'ROOT' },
        });
        if (!root) {
            root = this.categoryRepository.create({
                name: 'ROOT',
                description: 'Root category',
            });
            root = await treeRepo.save(root);
        }
        const orphanRoots = await this.categoryRepository.find({
            where: { parent: (0, typeorm_2.IsNull)() },
        });
        for (const orphan of orphanRoots) {
            if (orphan.id === root.id || orphan.name === 'ROOT')
                continue;
            orphan.parent = root;
            await treeRepo.save(orphan);
        }
        for (const seed of categories_data_1.seedCategoriesData) {
            let node = await this.categoryRepository.findOne({
                where: { name: seed.name },
            });
            if (node) {
                node.parent = root;
                node.description = seed.description;
                await treeRepo.save(node);
            }
            else {
                node = this.categoryRepository.create({
                    name: seed.name,
                    description: seed.description,
                    parent: root,
                });
                await treeRepo.save(node);
            }
        }
    }
};
exports.CategorySeedService = CategorySeedService;
exports.CategorySeedService = CategorySeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategorySeedService);
//# sourceMappingURL=category-seed.service.js.map