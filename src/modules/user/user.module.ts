// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../auditLog/auditlog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NotificationModule,
    AuditLogModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}