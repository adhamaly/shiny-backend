import { Test, TestingModule } from '@nestjs/testing';
import { WashingServicesService } from './washing-services.service';

describe('WashingServicesService', () => {
  let service: WashingServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WashingServicesService],
    }).compile();

    service = module.get<WashingServicesService>(WashingServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
