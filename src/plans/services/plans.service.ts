import { Injectable } from '@nestjs/common';
import { PlansRepository } from '../repositories/plans.repoistory';
import { CreatePlanDTO } from '../dtos/createPlan.dto';
import { PlansCitiesRepository } from '../repositories/plans-cities.repository';
import { CitiesService } from '../../city/city.service';
import { UserService } from '../../user/user.service';
import { UpdatePlanDTO } from '../dtos';
import { Plan } from '../schemas/plans.schema';
import { City } from '../../city/schemas/city.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { NearestCityCalculator } from '../../city/nearestCityCalculator.service';
import { QueryParamsDTO } from '../dtos/queryParams.dto';
import { AdminService } from '../../admin/admin.service';
import { Roles } from '../../admin/schemas/admin.schema';

@Injectable()
export class PlansService {
  constructor(
    private plansRepository: PlansRepository,
    private plansCitiesRepository: PlansCitiesRepository,
    private citiesService: CitiesService,
    private userService: UserService,
    private nearestCityCalculator: NearestCityCalculator,
    private adminService: AdminService,
  ) {}

  async createPlan(
    createPlanDTO: CreatePlanDTO,
    adminId: string,
    role: string,
  ) {
    if (!createPlanDTO.selectAll && !createPlanDTO.cities)
      throw new MethodNotAllowedResponse({
        ar: 'ادخل المدن',
        en: 'Select cities',
      });

    switch (role) {
      case Roles.SuperAdmin:
        await this.createPlanSuperAdmin(createPlanDTO);
        break;
      case Roles.SubAdmin:
        await this.createPlanSubAdmin(createPlanDTO, adminId);
        break;
      default:
        throw new MethodNotAllowedResponse({
          ar: 'غير مصرح لك',
          en: 'Not Auht',
        });
    }
  }
  async createPlanSuperAdmin(createPlanDTO: CreatePlanDTO) {
    if (!createPlanDTO.selectAll) {
      // check cities Active status
      for (const city of createPlanDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }
    const createdPlan = await this.plansRepository.create(createPlanDTO);

    await this.plansCitiesRepository.insertMany(
      createdPlan,
      createPlanDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SuperAdmin)
        : createPlanDTO.cities,
    );
  }

  async createPlanSubAdmin(createPlanDTO: CreatePlanDTO, adminId: string) {
    if (!createPlanDTO.selectAll) {
      // check admin permissions
      await this.adminService.CitiesPermissionCreation(
        adminId,
        createPlanDTO.cities,
      );
      // check cities Active status
      for (const city of createPlanDTO.cities) {
        await this.citiesService.checkCityExistence(city);
      }
    }

    const createdPlan = await this.plansRepository.create(createPlanDTO);

    await this.plansCitiesRepository.insertMany(
      createdPlan,
      createPlanDTO.selectAll
        ? await this.citiesService.getAdminCities(Roles.SubAdmin, adminId)
        : createPlanDTO.cities,
    );
  }

  async getAllForUser(userId: string, queryParamsDTO: QueryParamsDTO) {
    const user = await this.userService.getUserById(userId);

    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        plans: [],
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
        plans: [],
        message:
          user.language === 'en'
            ? 'Our Service Not Exist Waiting for us soon..'
            : 'خدماتنا غير متوفرة حاليا',
      };

    const plans = await this.plansRepository.findAll(city['city']._id);

    const formatedPlans = this.plansFormaterForUser(plans);

    return {
      plans: formatedPlans,
      message: !formatedPlans.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }
  async getAllForGuest(queryParamsDTO: QueryParamsDTO) {
    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        queryParamsDTO.country,
      )
    )
      return {
        plans: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(city['city']))
      return {
        plans: [],
        message: 'Our Service Not Exist Waiting for us soon..',
      };

    const plans = await this.plansRepository.findAll(city['city']._id);

    const formatedPlans = this.plansFormaterForUser(plans);

    return {
      plans: formatedPlans,
      message: !formatedPlans.length
        ? 'Our Service Not Exist Waiting for us soon..'
        : '',
    };
  }

  async getAllForAdmin(adminId: string, role: string) {
    switch (role) {
      case Roles.SuperAdmin:
        return await this.plansRepository.findAllForAdmins(role);
      case Roles.SubAdmin:
        const admin = await this.adminService.getById(adminId);
        const plans = await this.plansRepository.findAllForAdmins(
          role,
          admin.city,
        );
        return plans.filter((plan: any) => plan.cities.length >= 1);
      default:
        return [];
    }
  }
  plansFormaterForUser(plansList: any) {
    const filtered = plansList.filter((plan: any) => plan.cities.length >= 1);

    filtered.forEach((plan: any) => {
      plan.cities = undefined;
    });
    return filtered;
  }

  async getById(id: string) {
    return await this.plansRepository.findOneByIdOr404(id);
  }

  async getPlanByIdForAdmin(id: string, role: string, adminId: string) {
    switch (role) {
      case Roles.SuperAdmin:
        return await this.plansRepository.findOneByIdOr404(id);
      case Roles.SubAdmin:
        const admin = await this.adminService.getById(adminId);
        const plan = await this.plansRepository.findByIdOr404(
          id,
          role,
          admin.city,
        );

        if (!plan['cities'].length)
          throw new NotFoundResponse({
            ar: 'لاتوجد هذه الباقة',
            en: 'Plan Not Found',
          });

        return plan;
      default:
        return {};
    }
  }
  async updatePlan(id: string, updatePlanDTO: UpdatePlanDTO) {
    return await this.plansRepository.update(id, updatePlanDTO);
  }

  async addPlanToNewCity(plan: Plan, city: City, adminId: string) {
    // TODO:
    await this.adminService.CityPermissionForCreation(adminId, city);
    await this.citiesService.checkCityExistence(city);
    await this.plansCitiesRepository.insertOne(plan, city);
  }

  async deletePlanFromCity(plan: Plan, city: City) {
    // TODO:
    await this.plansCitiesRepository.deleteOne(plan, city);
  }

  async archivePlanFromCity(plan: Plan, city: City) {
    const planDocument = await this.plansCitiesRepository.findOne(plan, city);
    if (!planDocument)
      throw new NotFoundResponse({
        ar: 'الباقة لاتوجد في هذه المدينة',
        en: 'Plan is not Exist in this city',
      });

    planDocument.isArchived = true;
    await planDocument.save();
  }

  async activatePlanFromCity(plan: Plan, city: City) {
    const planDocument = await this.plansCitiesRepository.findOne(plan, city);

    if (!planDocument)
      throw new NotFoundResponse({
        ar: 'الباقة لاتوجد في هذه المدينة',
        en: 'Plan is not Exist in this city',
      });

    planDocument.isArchived = false;
    await planDocument.save();
  }
}
