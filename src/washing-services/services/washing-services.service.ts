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
import { AdminService } from '../../admin/admin.service';
import { QueryParamsDTO } from '../dtos/queryParams.dto';
import { NearestCityCalculator } from '../../city/nearestCityCalculator.service';
import { Roles } from '../../admin/schemas/admin.schema';
import mongoose from 'mongoose';

@Injectable()
export class WashingServicesService {
  constructor(
    private washingServicesRepository: WashingServicesRepository,
    private servicesIconsService: ServicesIconsService,
    private citiesService: CitiesService,
    private nearestCityCalculator: NearestCityCalculator,
    private userService: UserService,
    private servicesCitiesRepository: ServicesCitiesRepository,
    private adminService: AdminService,
  ) {}

  async createWashingService(
    createWashingServiceDTO: CreateWashingServiceDTO,
    adminId: string,
    role: string,
  ) {
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

    switch (role) {
      case Roles.SuperAdmin:
        await this.createWashingServiceSuperAdmin(createWashingServiceDTO);
        break;
      case Roles.SubAdmin:
        await this.createWashingServiceSubAdmin(
          createWashingServiceDTO,
          adminId,
        );
        break;
      default:
        throw new MethodNotAllowedResponse({
          ar: 'غير مصرح لك',
          en: 'Not Auth',
        });
    }
  }

  async createWashingServiceSuperAdmin(
    createWashingServiceDTO: CreateWashingServiceDTO,
  ) {
    if (!createWashingServiceDTO.selectAll) {
      // check cities Active status
      for (const city of createWashingServiceDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }
    const createdWashingService = await this.washingServicesRepository.create(
      createWashingServiceDTO,
    );
    await this.servicesCitiesRepository.insertMany(
      createdWashingService,
      createWashingServiceDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SuperAdmin)
        : createWashingServiceDTO.cities,
    );
  }

  async createWashingServiceSubAdmin(
    createWashingServiceDTO: CreateWashingServiceDTO,
    adminId: string,
  ) {
    if (!createWashingServiceDTO.selectAll) {
      // Check Cities Permissions
      await this.adminService.CitiesPermissionCreation(
        adminId,
        createWashingServiceDTO.cities,
      );
      // check cities Active status
      for (const city of createWashingServiceDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }

    const createdWashingService = await this.washingServicesRepository.create(
      createWashingServiceDTO,
    );
    await this.servicesCitiesRepository.insertMany(
      createdWashingService,
      createWashingServiceDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SubAdmin, adminId)
        : createWashingServiceDTO.cities,
    );
  }

  async getAllWashingServicesForAdmin(role: string, adminId: string) {
    switch (role) {
      case Roles.SuperAdmin:
        const washingServicesForSuperAdmin =
          await this.washingServicesRepository.findAllForAdmins(role);
        washingServicesForSuperAdmin.forEach((washingService) => {
          washingService.cities = undefined;
        });
        return washingServicesForSuperAdmin;
      case Roles.SubAdmin:
        const admin = await this.adminService.getById(adminId);
        const washingServices =
          await this.washingServicesRepository.findAllForAdmins(
            role,
            admin.city,
          );

        return this.washingServicesFormater(washingServices);
      default:
        return [];
    }
  }

  /** TODO:- For User (Active Service & his city) and when view orders return any status
   *             Biker Return Only Active Service
   *             Admin Return All
   *
   *
   *
   */
  async getAllWashingServicesForUser(
    userId: string,
    queryParamsDTO: QueryParamsDTO,
  ) {
    const user = await this.userService.getUserById(userId);

    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        washingServices: [],
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(city['city']))
      return {
        washingServices: [],
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const washingServices = await this.washingServicesRepository.findAll(
      city['city']._id,
    );

    const formatedWashingServices =
      this.washingServicesFormater(washingServices);

    return {
      washingServices: formatedWashingServices,
      message: !formatedWashingServices.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }
  async getAllWashingServicesForGuest(queryParamsDTO: QueryParamsDTO) {
    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        washingServices: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(city['city']))
      return {
        washingServices: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const washingServices = await this.washingServicesRepository.findAll(
      city['city']._id,
    );

    const formatedWashingServices =
      this.washingServicesFormater(washingServices);

    return {
      washingServices: formatedWashingServices,
      message: !formatedWashingServices.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }

  washingServicesFormater(servicesList: any) {
    const filtered = servicesList.filter(
      (washingService: any) => washingService.cities.length >= 1,
    );

    filtered.forEach((washingService) => {
      washingService.cities = undefined;
    });
    return filtered;
  }

  async getWashingServiceByIdForAdmin(id: string) {
    return await this.washingServicesRepository.findOneByIdOr404(id);
  }

  async getWashingServiceById(id: string) {
    return await this.washingServicesRepository.findOneOr404(id);
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

  async addWashingServiceToNewCity(
    washingService: WashingService,
    city: City,
    adminId: string,
  ) {
    // TODO: Check city permission for admin and active status for city
    await this.adminService.CityPermissionForCreation(adminId, city);
    await this.citiesService.checkCityExistence(city);
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

  async getTotalDurationForWashingServices(washingServices: any[]) {
    console.log(washingServices);
    const parsedWashingServices = [];
    for (const item of washingServices) {
      parsedWashingServices.push(new mongoose.Types.ObjectId(item));
    }
    const orderWashingServices =
      await this.washingServicesRepository.findOrderWashingServices(
        parsedWashingServices,
      );

    let totalDuration = 0;
    orderWashingServices.forEach((washingService) => {
      totalDuration += washingService.duration;
    });

    return totalDuration;
  }
}
