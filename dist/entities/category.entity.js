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
exports.Category = void 0;
const typeorm_1 = require("typeorm");
const part_entity_1 = require("./part.entity");
const base_entity_1 = require("./base.entity");
const image_entity_1 = require("./image.entity");
let Category = class Category extends base_entity_1.BaseEntity {
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], Category.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", Category)
], Category.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => part_entity_1.Part, (part) => part.category, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Category.prototype, "parts", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => image_entity_1.Image, (image) => image.category, {
        nullable: true,
        onDelete: 'SET NULL',
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", image_entity_1.Image)
], Category.prototype, "image", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)('categories'),
    (0, typeorm_1.Tree)('materialized-path')
], Category);
//# sourceMappingURL=category.entity.js.map