import { Test, TestingModule } from '@nestjs/testing';
import { AdminBikerController } from './adminBikers.controller';

describe('AdminBikerController', () => {
  let controller: AdminBikerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBikerController],
    }).compile();

    controller = module.get<AdminBikerController>(AdminBikerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
