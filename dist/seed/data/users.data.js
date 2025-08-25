"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsersData = void 0;
const entity_enum_1 = require("../../common/enum/entity.enum");
exports.seedUsersData = [
    {
        email: 'admin@example.com',
        fullName: 'Admin User',
        phoneNumber: '+10000000001',
        role: entity_enum_1.UserRoleEnum.ADMIN,
        password: 'Password123!'
    },
    {
        email: 'manager@example.com',
        fullName: 'Manager User',
        phoneNumber: '+10000000002',
        role: entity_enum_1.UserRoleEnum.MANAGER,
        password: 'Password123!'
    },
    {
        email: 'dev@example.com',
        fullName: 'Developer User',
        phoneNumber: '+10000000003',
        role: entity_enum_1.UserRoleEnum.DEV,
        password: 'Password123!'
    }
];
//# sourceMappingURL=users.data.js.map