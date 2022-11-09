import { Injectable } from '@nestjs/common';
import { PlansRepository } from '../repositories/plans.repoistory';
import { CreatePlanDTO } from '../dtos/createPlan.dto';

@Injectable()
export class PlansService {
  constructor(private plansRepository: PlansRepository) {}

  async createPlan(createPlanDTO: CreatePlanDTO) {
    await this.plansRepository.create(createPlanDTO);
  }

  async getAll(role: string) {
    return await this.plansRepository.findAll(role);
  }

  async getById(id: string) {
    return await this.plansRepository.findByIdOr404(id);
  }
  async updatePlan(id: string, createPlanDTO: CreatePlanDTO) {
    return await this.plansRepository.update(id, createPlanDTO);
  }

  async archivePlan(id: string) {
    const planDocument = await this.plansRepository.findByIdOr404(id);
    planDocument.isArchived = true;
    await planDocument.save();

    return planDocument;
  }
  async activatePlan(id: string) {
    const planDocument = await this.plansRepository.findByIdOr404(id);
    planDocument.isArchived = false;
    await planDocument.save();

    return planDocument;
  }
}
