import { RoleEnum } from '../../../common/enum/entity.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: RoleEnum[]) => import("@nestjs/common").CustomDecorator<string>;
