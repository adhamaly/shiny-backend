import { Test, TestingModule } from '@nestjs/testing';
import { WashingServicesController } from './washing-services.controller';

describe('WashingServicesController', () => {
  let controller: WashingServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WashingServicesController],
    }).compile();

    controller = module.get<WashingServicesController>(WashingServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
