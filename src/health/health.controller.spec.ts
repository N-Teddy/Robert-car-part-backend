import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
	HealthCheckService,
	HttpHealthIndicator,
	DiskHealthIndicator,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
	let controller: HealthController;

	// Mock services
	const mockHealthCheckService = {
		check: jest.fn(() => Promise.resolve({ status: 'ok' })),
	};

	const mockHttpHealthIndicator = {
		pingCheck: jest.fn(),
	};

	const mockDiskHealthIndicator = {
		checkStorage: jest.fn(),
	};

	const mockTypeOrmHealthIndicator = {
		pingCheck: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: mockHealthCheckService,
				},
				{
					provide: HttpHealthIndicator,
					useValue: mockHttpHealthIndicator,
				},
				{
					provide: DiskHealthIndicator,
					useValue: mockDiskHealthIndicator,
				},
				{
					provide: TypeOrmHealthIndicator,
					useValue: mockTypeOrmHealthIndicator,
				},
			],
		}).compile();

		controller = module.get<HealthController>(HealthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	// Add more tests for the health check endpoints
	describe('check', () => {
		it('should return health status', async () => {
			const result = await controller.check();
			expect(result).toEqual({ status: 'ok' });
			expect(mockHealthCheckService.check).toHaveBeenCalled();
		});
	});
});
