import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { seedUsersData } from './data/users.data';

@Injectable()
export class UserSeedService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async run() {
        const saltRounds = 12;

        for (const seed of seedUsersData) {
            const existing = await this.userRepository.findOne({ where: { email: seed.email } });
            const hashedPassword = await bcrypt.hash(seed.password, saltRounds);
            if (existing) {
                await this.userRepository.update({ id: existing.id }, {
                    fullName: seed.fullName,
                    phoneNumber: seed.phoneNumber,
                    role: seed.role,
                    isFirstLogin: false,
                    password: hashedPassword,
                });
            } else {
                const created = this.userRepository.create({
                    email: seed.email,
                    fullName: seed.fullName,
                    phoneNumber: seed.phoneNumber,
                    role: seed.role,
                    isFirstLogin: false,
                    password: hashedPassword,
                });
                await this.userRepository.save(created);
            }
        }
    }
}