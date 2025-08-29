import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../../entities/notification.entity';
import { Image } from '../../entities/image.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Notification, Image]),
    ],
    controllers: [UserController],
    providers: [UserService, NotificationService],
    exports: [UserService],
})
export class UserModule { }