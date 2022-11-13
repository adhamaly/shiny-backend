import { Injectable } from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesRepository } from '../repositories/washing-services.repository';
import { ServicesIconsService } from '../../services-icons/services-icons.service';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { CitiesService } from '../../city/city.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class WashingServicesService {
  constructor(
    private washingServicesRepository: WashingServicesRepository,
    private servicesIconsService: ServicesIconsService,
    private citiesService: CitiesService,
    private userService: UserService,
  ) {}

  async createWashingService(createWashingServiceDTO: CreateWashingServiceDTO) {
    if (
      !(await this.servicesIconsService.isExist(
        String(createWashingServiceDTO.icon),
      ))
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الايقونة',
        en: 'Icon Not Found',
      });

    if (createWashingServiceDTO.selectAll) {
      const cities = await this.citiesService.getCities();

      await this.washingServicesRepository.createServiceForAllCities(
        createWashingServiceDTO,
        cities,
      );

      return;
    }

    await this.washingServicesRepository.create(createWashingServiceDTO);
  }

  /** TODO:- For User (Active Service & his city) and when view orders return any status
   *             Biker Return Only Active Service
   *             Admin Return All
   *
   *
   *
   */
  async getAll(clientId: string, role: string) {
    if (role === 'user') {
      const user = await this.userService.getUserById(clientId);
    }
    return await this.washingServicesRepository.findAll(role);
  }

  /** TODO:- For User Active Service For his city and when view orders return any status
   *             Biker Return Only Active Service
   *             Admin Return All
   *
   *
   *
   */
  async getByIdOr404(id: string, role: string) {
    return await this.washingServicesRepository.findOneByIdOr404(id, role);
  }
  async update(id: string, createWashingServiceDTO: CreateWashingServiceDTO) {
    if (
      await this.servicesIconsService.isExist(
        String(createWashingServiceDTO.icon),
      )
    )
      await this.washingServicesRepository.update(id, createWashingServiceDTO);
  }
}
