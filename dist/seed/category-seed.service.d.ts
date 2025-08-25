import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
export declare class CategorySeedService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    run(): Promise<void>;
}
