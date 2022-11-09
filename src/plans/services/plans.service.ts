import { Injectable } from '@nestjs/common';
import { PlansRepository } from '../repositories/plans.repoistory';
import { CreatePlanDTO } from '../dtos/createPlan.dto';

@Injectable()
export class PlansService {
  constructor(private plansRepository: PlansRepository) {}

  async createPlan(CreatePlanDTO) {}
}
