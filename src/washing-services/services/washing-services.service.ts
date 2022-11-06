import { Injectable } from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesRepository } from '../repositories/washing-services.repository';

@Injectable()
export class WashingServicesService {
  constructor(private washingServicesRepository: WashingServicesRepository) {}

  async createWashingService(createWashingServiceDTO: CreateWashingServiceDTO) {
    await this.washingServicesRepository.create(createWashingServiceDTO);
  }
}
