import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
export declare class SeedService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>);
    onApplicationBootstrap(): Promise<void>;
    seedUsers(): Promise<{
        created: number;
        skipped: number;
    }>;
}
