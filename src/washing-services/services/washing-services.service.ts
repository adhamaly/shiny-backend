import { Injectable } from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesRepository } from '../repositories/washing-services.repository';
import { ServicesIconsService } from '../../services-icons/services-icons.service';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { CitiesService } from '../../city/city.service';

@Injectable()
export class WashingServicesService {
  constructor(
    private washingServicesRepository: WashingServicesRepository,
    private servicesIconsService: ServicesIconsService,
    private citiesService: CitiesService,
  ) {}

  async createWashingService(createWashingServiceDTO: CreateWashingServiceDTO) {
    if (
      !(await this.servicesIconsService.isExistOr404(
        String(createWashingServiceDTO.icon),
      ))
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الايقونة',
        en: 'Icon Not Found',
      });

    // Check SelectAll key for cities
    let cities = [];
    if (createWashingServiceDTO.selectAll) {
      cities = await this.citiesService.getCities();
    }
    await this.washingServicesRepository.create(
      createWashingServiceDTO,
      createWashingServiceDTO.selectAll
        ? cities
        : createWashingServiceDTO.cities,
    );
  }

  async getAll(role: string) {
    return await this.washingServicesRepository.findAll(role);
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
    if (
      await this.servicesIconsService.isExistOr404(
        String(createWashingServiceDTO.icon),
      )
    )
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
