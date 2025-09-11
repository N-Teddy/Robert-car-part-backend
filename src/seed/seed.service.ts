import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { SAMPLE_USERS } from './data/user.data';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async onApplicationBootstrap() {
        await this.seedUsers();
    }

    async seedUsers(): Promise<{ created: number; skipped: number }> {
        try {
            const result = { created: 0, skipped: 0 };

            for (const userData of SAMPLE_USERS) {
                const existingUser = await this.userRepository.findOne({
                    where: { email: userData.email },
                });

                if (existingUser) {
                    this.logger.log(`User ${userData.email} already exists. Skipping...`);
                    result.skipped++;
                    continue;
                }

                const hashedPassword = await bcrypt.hash(userData.password, 10);

                const user = this.userRepository.create({
                    ...userData,
                    password: hashedPassword,
                });

                await this.userRepository.save(user);
                this.logger.log(`Created user: ${userData.email} (${userData.role})`);
                result.created++;
            }

            this.logger.log(
                `Seed completed. Created: ${result.created}, Skipped: ${result.skipped}`,
            );
            return result;
        } catch (error) {
            this.logger.error('Failed to seed users', error.stack);
            throw error;
        }
    }
}