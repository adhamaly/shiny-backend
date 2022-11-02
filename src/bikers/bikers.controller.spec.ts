import { Test, TestingModule } from '@nestjs/testing';
import { BikersController } from './bikers.controller';

describe('BikersController', () => {
  let controller: BikersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikersController],
    }).compile();

    controller = module.get<BikersController>(BikersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
