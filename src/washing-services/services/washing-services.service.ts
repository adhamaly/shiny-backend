import { Injectable } from '@nestjs/common';
import { CreateWashingServiceDTO, UpdateWashingServiceDTO } from '../dtos';
import { WashingServicesRepository } from '../repositories/washing-services.repository';
import { ServicesIconsService } from '../../services-icons/services-icons.service';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { CitiesService } from '../../city/city.service';
import { UserService } from '../../user/user.service';
import { City } from '../../city/schemas/city.schema';
import { ServicesCitiesRepository } from '../repositories/services-cities.repository';
import { WashingService } from '../schemas/washing-services.schema';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';

@Injectable()
export class WashingServicesService {
  constructor(
    private washingServicesRepository: WashingServicesRepository,
    private servicesIconsService: ServicesIconsService,
    private citiesService: CitiesService,
    private userService: UserService,
    private servicesCitiesRepository: ServicesCitiesRepository,
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

    if (!createWashingServiceDTO.selectAll && !createWashingServiceDTO.cities)
      throw new MethodNotAllowedResponse({
        ar: 'ادخل المدن',
        en: 'Select cities',
      });

    const createdWashingService = await this.washingServicesRepository.create(
      createWashingServiceDTO,
    );
    await this.servicesCitiesRepository.insertMany(
      createdWashingService,
      createWashingServiceDTO.selectAll
        ? await this.citiesService.getCities()
        : createWashingServiceDTO.cities,
    );
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
      const washingServices = await this.washingServicesRepository.findAll(
        role,
        user.location.city,
      );

      return this.washingServicesFormaterForUser(washingServices);
    }
    return await this.washingServicesRepository.findAll(role);
  }
  washingServicesFormaterForUser(servicesList: any) {
    const filtered = servicesList.filter(
      (washingService: any) => washingService.cities.length >= 1,
    );

    filtered.forEach((washingService) => {
      washingService.cities = undefined;
    });
    return filtered;
  }

  /** TODO:- For User Active Service For his city and when view orders return any status
   *             Biker Return Only Active Service
   *             Admin Return All
   *
   *
   *
   */
  async getByIdOr404(id: string, role: string, clientId: string) {
    if (role === 'user') {
      const user = await this.userService.getUserById(clientId);
      const washingService =
        await this.washingServicesRepository.findOneByIdOr404(
          id,
          role,
          user.location.city,
        );

      washingService['cities'] = undefined;

      return washingService;
    }
    return await this.washingServicesRepository.findOneByIdOr404(id, role);
  }
  async update(id: string, updateWashingServiceDTO: UpdateWashingServiceDTO) {
    if (
      await this.servicesIconsService.isExist(
        String(updateWashingServiceDTO.icon),
      )
    )
      return await this.washingServicesRepository.update(
        id,
        updateWashingServiceDTO,
      );
  }

  async addWashingServiceToNewCity(washingService: WashingService, city: City) {
    // TODO:
    await this.servicesCitiesRepository.insertOne(washingService, city);
  }

  async deleteWashingServiceFromCity(
    washingService: WashingService,
    city: City,
  ) {
    // TODO:
    await this.servicesCitiesRepository.deleteOne(washingService, city);
  }

  async archiveWashingServiceFromCity(
    washingService: WashingService,
    city: City,
  ) {
    const washingServiceCity = await this.servicesCitiesRepository.findOne(
      washingService,
      city,
    );
    if (!washingServiceCity)
      throw new NotFoundResponse({
        ar: 'الخدمة لاتوجد في هذه المدينة',
        en: 'Washing Service is not Exist in this city',
      });

    washingServiceCity.isArchived = true;
    await washingServiceCity.save();
  }

  async activateWashingServiceFromCity(
    washingService: WashingService,
    city: City,
  ) {
    const washingServiceCity = await this.servicesCitiesRepository.findOne(
      washingService,
      city,
    );
    if (!washingServiceCity)
      throw new NotFoundResponse({
        ar: 'الخدمة لاتوجد في هذه المدينة',
        en: 'Washing Service is not Exist in this city',
      });

    washingServiceCity.isArchived = false;
    await washingServiceCity.save();
  }
}
