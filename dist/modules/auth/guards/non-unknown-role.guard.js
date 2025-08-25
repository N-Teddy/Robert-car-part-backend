"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonUnknownRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const entity_enum_1 = require("../../../common/enum/entity.enum");
let NonUnknownRoleGuard = class NonUnknownRoleGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (user?.role === entity_enum_1.UserRoleEnum.UNKNOWN) {
            throw new common_1.ForbiddenException('Your account is pending role assignment by an administrator.');
        }
        return true;
    }
};
exports.NonUnknownRoleGuard = NonUnknownRoleGuard;
exports.NonUnknownRoleGuard = NonUnknownRoleGuard = __decorate([
    (0, common_1.Injectable)()
], NonUnknownRoleGuard);
//# sourceMappingURL=non-unknown-role.guard.js.map