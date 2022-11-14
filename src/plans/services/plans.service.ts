import { Injectable } from '@nestjs/common';
import { PlansRepository } from '../repositories/plans.repoistory';
import { CreatePlanDTO } from '../dtos/createPlan.dto';
import { PlansCitiesRepository } from '../repositories/plans-cities.repository';
import { CitiesService } from '../../city/city.service';
import { UserService } from '../../user/user.service';
import { UpdatePlanDTO } from '../dtos';

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
}
