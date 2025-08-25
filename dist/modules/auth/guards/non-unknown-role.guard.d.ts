import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class NonUnknownRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
