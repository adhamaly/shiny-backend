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

@Injectable()
export class PlansService {
  constructor(
    private plansRepository: PlansRepository,
    private plansCitiesRepository: PlansCitiesRepository,
    private citiesService: CitiesService,
    private userService: UserService,
  ) {}

  async createPlan(createPlanDTO: CreatePlanDTO) {
    const createdPlan = await this.plansRepository.create(createPlanDTO);

    if (!createPlanDTO.selectAll && !createPlanDTO.cities)
      throw new MethodNotAllowedResponse({
        ar: 'ادخل المدن',
        en: 'Select cities',
      });

    await this.plansCitiesRepository.insertMany(
      createdPlan,
      createPlanDTO.selectAll
        ? await this.citiesService.getCities()
        : createPlanDTO.cities,
    );
  }

  async getAll(clientId: string, role: string) {
    if (role === 'user') {
      const user = await this.userService.getUserById(clientId);
      const plans = await this.plansRepository.findAll(
        role,
        user.location.city,
      );
      return this.plansFormaterForUser(plans);
    }

    return await this.plansRepository.findAll(role);
  }
  plansFormaterForUser(plansList: any) {
    const filtered = plansList.filter((plan: any) => plan.cities.length >= 1);

    filtered.forEach((plan: any) => {
      plan.cities = undefined;
    });
    return filtered;
  }

  async getById(id: string, clientId: string, role: string) {
    if (role === 'user') {
      const user = await this.userService.getUserById(clientId);
      const plan = await this.plansRepository.findByIdOr404(
        id,
        role,
        user.location.city,
      );

      plan['cities'] = undefined;
      return plan;
    }

    return await this.plansRepository.findByIdOr404(id, role);
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
