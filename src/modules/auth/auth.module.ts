// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../auditLog/auditlog.module';
import { PasswordResetToken } from 'src/entities/password-reset-token.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, PasswordResetToken]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('jwt.secret'),
				signOptions: {
					expiresIn: configService.get<string>('jwt.expiresIn'),
				},
			}),
			inject: [ConfigService],
		}),
		NotificationModule,
		AuditLogModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
