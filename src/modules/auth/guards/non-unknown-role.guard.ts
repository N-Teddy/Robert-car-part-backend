import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from '@nestjs/common';
import { UserRoleEnum } from '../../../common/enum/entity.enum';

@Injectable()
export class NonUnknownRoleGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		if (user?.role === UserRoleEnum.UNKNOWN) {
			throw new ForbiddenException(
				'Your account is pending role assignment by an administrator.'
			);
		}
		return true;
	}
}
