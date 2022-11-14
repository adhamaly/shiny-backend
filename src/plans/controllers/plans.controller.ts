import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from '../services/plans.service';
import { CreatePlanDTO } from '../dtos/createPlan.dto';
import { Account } from '../../common/decorators/user.decorator';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { UpdatePlanDTO } from '../dtos';
import { UpdatePlanCitiesDTO } from '../dtos/updatePlanCities.dto';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Post()
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async createPlanController(@Body() createPlanDTO: CreatePlanDTO) {
    await this.plansService.createPlan(createPlanDTO);

    return {
      success: true,
    };
  }

  @Get()
  @UseGuards(UserAuthGuard)
  async getAllPlansController(@Account() account: any) {
    return {
      success: true,
      data: await this.plansService.getAll(account.id, account.role),
    };
  }

  @Get(':planId')
  @UseGuards(UserAuthGuard)
  async getPlanByIdController(
    @Param('planId') planId: string,
    @Account() account: any,
  ) {
    return {
      success: true,
      data: await this.plansService.getById(planId, account.id, account.role),
    };
  }

  @Put(':planId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async updatePlanController(
    @Param('planId') planId: string,
    @Body() updatePlanDTO: UpdatePlanDTO,
  ) {
    return {
      success: true,
      data: await this.plansService.updatePlan(planId, updatePlanDTO),
    };
  }

  @Post('/plans-cities')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async addPlanToCityController(
    @Body() updatePlanCitiesDTO: UpdatePlanCitiesDTO,
  ) {
    await this.plansService.addPlanToNewCity(
      updatePlanCitiesDTO.plan,
      updatePlanCitiesDTO.city,
    );

    return {
      success: true,
    };
  }

  @Delete('/plans-cities')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async deletePlanFromCityController(
    @Body() updatePlanCitiesDTO: UpdatePlanCitiesDTO,
  ) {
    await this.plansService.deletePlanFromCity(
      updatePlanCitiesDTO.plan,
      updatePlanCitiesDTO.city,
    );

    return {
      success: true,
    };
  }

  @Put('/plans-cities/archive')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async archivePlanFromCityController(
    @Body() updatePlanCitiesDTO: UpdatePlanCitiesDTO,
  ) {
    // TODO:
    await this.plansService.archivePlanFromCity(
      updatePlanCitiesDTO.plan,
      updatePlanCitiesDTO.city,
    );

    return {
      success: true,
    };
  }

  @Put('/plans-cities/activate')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async activatePlanFromCityController(
    @Body() updatePlanCitiesDTO: UpdatePlanCitiesDTO,
  ) {
    // TODO:
    await this.plansService.activatePlanFromCity(
      updatePlanCitiesDTO.plan,
      updatePlanCitiesDTO.city,
    );

    return {
      success: true,
    };
  }
}
