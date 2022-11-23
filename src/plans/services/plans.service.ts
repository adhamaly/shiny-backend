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
      case 'superAdmin':
        await this.createPlanSuperAdmin(createPlanDTO);
        break;
      case 'subAdmin':
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
    const createdPlan = await this.plansRepository.create(createPlanDTO);

    await this.plansCitiesRepository.insertMany(
      createdPlan,
      createPlanDTO.selectAll
        ? await this.citiesService.getCities()
        : createPlanDTO.cities,
    );
  }

  async createPlanSubAdmin(createPlanDTO: CreatePlanDTO, adminId: string) {
    if (!createPlanDTO.selectAll)
      await this.adminService.CityPermissionCreation(
        adminId,
        createPlanDTO.cities,
      );

    const admin = await this.adminService.getById(adminId);

    const createdPlan = await this.plansRepository.create(createPlanDTO);

    await this.plansCitiesRepository.insertMany(
      createdPlan,
      createPlanDTO.selectAll ? admin.city : createPlanDTO.cities,
    );
  }

  async getAllForUser(role: string, queryParamsDTO: QueryParamsDTO) {
    if (
      queryParamsDTO.country !== 'Egypt' &&
      queryParamsDTO.country !== 'egypt'
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الباقة في هذه الدولة',
        en: 'Plan Not Found in Country',
      });

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    const plans = await this.plansRepository.findAll(role, [city['city']._id]);

    return this.plansFormaterForUser(plans);
  }

  async getAllForAdmin(adminId: string, role: string) {
    const admin = await this.adminService.getById(adminId);
    return await this.plansRepository.findAll(role, admin.city);
  }
  plansFormaterForUser(plansList: any) {
    const filtered = plansList.filter((plan: any) => plan.cities.length >= 1);

    filtered.forEach((plan: any) => {
      plan.cities = undefined;
    });
    return filtered;
  }

  async getByIdForUser(
    id: string,
    role: string,
    queryParamsDTO: QueryParamsDTO,
  ) {
    if (
      queryParamsDTO.country !== 'Egypt' &&
      queryParamsDTO.country !== 'egypt'
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الباقة في هذه الدولة',
        en: 'Plan Not Found in Country',
      });

    const city = await this.nearestCityCalculator.findNearestCity(
      Number(queryParamsDTO.latitude),
      Number(queryParamsDTO.longitude),
    );

    const plan = await this.plansRepository.findByIdOr404(id, role, [
      city['city']._id,
    ]);

    if (!plan['cities'].length)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الباقة',
        en: 'Plan Not Found',
      });

    plan['cities'] = undefined;

    return plan;
  }

  async getPlanByIdForAdmin(id: string, role: string, adminId: string) {
    const admin = await this.adminService.getById(adminId);
    const plan = await this.plansRepository.findByIdOr404(id, role, admin.city);

    if (!plan['cities'].length)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الباقة',
        en: 'Plan Not Found',
      });

    return plan;
  }
  async updatePlan(id: string, updatePlanDTO: UpdatePlanDTO) {
    return await this.plansRepository.update(id, updatePlanDTO);
  }

  async addPlanToNewCity(plan: Plan, city: City) {
    // TODO:
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
