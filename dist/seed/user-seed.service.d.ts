import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UserSeedService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    run(): Promise<void>;
}
