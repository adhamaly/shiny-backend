import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PlansService } from '../services/plans.service';
import { CreatePlanDTO } from '../dtos/createPlan.dto';
import { Account } from 'src/common/decorators/user.decorator';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Post()
  async createPlanController(@Body() createPlanDTO: CreatePlanDTO) {
    await this.plansService.createPlan(createPlanDTO);

    return {
      success: true,
    };
  }

  @Get()
  async getAllPlansController(@Account() account: any) {
    return {
      success: true,
      data: await this.plansService.getAll(account.role),
    };
  }

  @Get(':planId')
  async getPlanByIdController(@Param('planId') planId: string) {
    return {
      success: true,
      data: await this.plansService.getById(planId),
    };
  }

  @Put(':planId')
  async updatePlanController(
    @Param('planId') planId: string,
    @Body() createPlanDTO: CreatePlanDTO,
  ) {
    return {
      success: true,
      data: await this.plansService.updatePlan(planId, createPlanDTO),
    };
  }

  @Put(':planId/archive')
  async archivePlanController(@Param('planId') planId: string) {
    return {
      success: true,
      data: await this.plansService.archivePlan(planId),
    };
  }

  @Put(':planId/activate')
  async activatePlanController(@Param('planId') planId: string) {
    return {
      success: true,
      data: await this.plansService.activatePlan(planId),
    };
  }
}
