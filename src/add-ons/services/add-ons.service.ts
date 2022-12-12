import { Injectable } from '@nestjs/common';
import { CreateAddOnsDTO } from '../dtos/createAddOns.dto';
import { AddOnsRepository } from '../repositories/add-ons.repository';
import { AddOnsCitiesRepository } from '../repositories/add-ons-cities.repository';
import { ServicesIconsService } from '../../services-icons/services-icons.service';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { Roles } from 'src/admin/schemas/admin.schema';
import { CitiesService } from '../../city/city.service';
import { AdminService } from '../../admin/admin.service';
import { QueryParamsDTO } from '../dtos/add-ons-queryParams.dto';
import { UserService } from '../../user/user.service';
import { NearestCityCalculator } from '../../city/nearestCityCalculator.service';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';

@Injectable()
export class AddOnsService {
  constructor(
    private addOnsRepository: AddOnsRepository,
    private addOnsCitiesRepository: AddOnsCitiesRepository,
    private servicesIconsService: ServicesIconsService,
    private citiesService: CitiesService,
    private adminService: AdminService,
    private userService: UserService,
    private nearestCityCalculator: NearestCityCalculator,
  ) {}

  async createAddOns(
    createAddOnsDTO: CreateAddOnsDTO,
    adminId: string,
    role: string,
  ) {
    if (
      !(await this.servicesIconsService.isExist(String(createAddOnsDTO.icon)))
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الايقونة',
        en: 'Icon Not Found',
      });

    if (!createAddOnsDTO.selectAll && !createAddOnsDTO.cities)
      throw new MethodNotAllowedResponse({
        ar: 'ادخل المدن',
        en: 'Select cities',
      });

    switch (role) {
      case Roles.SuperAdmin:
        await this.createAddOnsSuperAdmin(createAddOnsDTO);
        break;
      case Roles.SubAdmin:
        await this.createAddOnsSubAdmin(createAddOnsDTO, adminId);
        break;
      default:
        throw new MethodNotAllowedResponse({
          ar: 'غير مصرح لك',
          en: 'Not Auth',
        });
    }
  }

  async createAddOnsSuperAdmin(createAddOnsDTO: CreateAddOnsDTO) {
    if (!createAddOnsDTO.selectAll) {
      // check cities Active status
      for (const city of createAddOnsDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }
    const createdAddOns = await this.addOnsRepository.create(createAddOnsDTO);

    await this.addOnsCitiesRepository.insertMany(
      createdAddOns,
      createAddOnsDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SuperAdmin)
        : createAddOnsDTO.cities,
    );
  }

  async createAddOnsSubAdmin(
    createAddOnsDTO: CreateAddOnsDTO,
    adminId: string,
  ) {
    if (!createAddOnsDTO.selectAll) {
      // Check Cities Permissions
      await this.adminService.CitiesPermissionCreation(
        adminId,
        createAddOnsDTO.cities,
      );
      // check cities Active status
      for (const city of createAddOnsDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }

    const createdAddOns = await this.addOnsRepository.create(createAddOnsDTO);

    await this.addOnsCitiesRepository.insertMany(
      createdAddOns,
      createAddOnsDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SubAdmin, adminId)
        : createAddOnsDTO.cities,
    );
  }
  async getAllAddOnsForUser(userId: string, queryParamsDTO: QueryParamsDTO) {
    const user = await this.userService.getUserById(userId);

    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        addOnses: [],
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
        addOnses: [],
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const addOnses = await this.addOnsRepository.findAll(city['city']._id);

    const formatedAddOnses = this.addOnsFormaterForUser(addOnses);

    return {
      addOnses: formatedAddOnses,
      message: !formatedAddOnses.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }
  async getAllAddOnsForGuest(queryParamsDTO: QueryParamsDTO) {
    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        addOnses: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(city['city']))
      return {
        addOnses: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const addOnses = await this.addOnsRepository.findAll(city['city']._id);

    const formatedAddOnses = this.addOnsFormaterForUser(addOnses);

    return {
      addOnses: formatedAddOnses,
      message: !formatedAddOnses.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }

  addOnsFormaterForUser(addOnsList: any) {
    const filtered = addOnsList.filter(
      (addOns: any) => addOns.cities.length >= 1,
    );

    filtered.forEach((addOns) => {
      addOns.cities = undefined;
    });
    return filtered;
  }
}
