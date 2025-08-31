import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('jwt.secret'),
			issuer: configService.get('jwt.issuer'),
			audience: configService.get('jwt.audience'),
		});
	}

	async validate(payload: any) {
		const user = await this.userRepository.findOne({
			where: { id: payload.sub },
			relations: ['profileImage'],
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			fullName: user.fullName,
		};
	}
}
