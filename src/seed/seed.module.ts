import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [SeedService],
})
export class SeedModule {}
