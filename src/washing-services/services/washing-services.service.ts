import { Injectable } from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesRepository } from '../repositories/washing-services.repository';

@Injectable()
export class WashingServicesService {
  constructor(private washingServicesRepository: WashingServicesRepository) {}

  async createWashingService(createWashingServiceDTO: CreateWashingServiceDTO) {
    await this.washingServicesRepository.create(createWashingServiceDTO);
  }

  /** TODO:- For User Active Services and when view orders return any status
   *             Biker Return Only Active Services
   *             Admin Return All
   *
   *
   *
   */
  async getAll() {
    return await this.washingServicesRepository.findAll();
  }

  /** TODO:- For User Active Service and when view orders return any status
   *             Biker Return Only Active Service
   *             Admin Return All
   *
   *
   *
   */
  async getByIdOr404(id: string) {
    return await this.washingServicesRepository.findOneByIdOr404(id);
  }
  async update(id: string, createWashingServiceDTO: CreateWashingServiceDTO) {
    await this.washingServicesRepository.update(id, createWashingServiceDTO);
  }

  async archive(id: string) {
    const washingService =
      await this.washingServicesRepository.findOneByIdOr404(id);

    washingService.isArchived = true;
    await washingService.save();
  }

  async activate(id: string) {
    const washingService =
      await this.washingServicesRepository.findOneByIdOr404(id);

    washingService.isArchived = false;
    await washingService.save();
  }
}
