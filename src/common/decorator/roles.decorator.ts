import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../../../common/enum/entity.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);