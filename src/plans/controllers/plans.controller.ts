import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from '../services/plans.service';
import { CreatePlanDTO } from '../dtos/createPlan.dto';
import { Account } from '../../common/decorators/user.decorator';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { UpdatePlanDTO } from '../dtos';
import { UpdatePlanCitiesDTO } from '../dtos/updatePlanCities.dto';
import { QueryParamsDTO } from '../dtos/queryParams.dto';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Post()
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async createPlanController(
    @Body() createPlanDTO: CreatePlanDTO,
    @Account() account: any,
  ) {
    await this.plansService.createPlan(createPlanDTO, account.id, account.role);

    return {
      success: true,
    };
  }

  @Get('user')
  @UseGuards(UserAuthGuard)
  async getAllPlansForUserController(
    @Account() account: any,
    @Query() queryParamsDTO: QueryParamsDTO,
  ) {
    const result = await this.plansService.getAllForUser(
      account.id,
      account.role,
      queryParamsDTO,
    );
    return {
      success: true,
      message: result.message,
      data: result.plans,
    };
  }

  @Get('guest')
  async getAllPlansForGuestController(@Query() queryParamsDTO: QueryParamsDTO) {
    const result = await this.plansService.getAllForGuest(
      'guest',
      queryParamsDTO,
    );
    return {
      success: true,
      message: result.message,
      data: result.plans,
    };
  }

  @Get('admin')
  @UseGuards(UserAuthGuard)
  async getAllPlansForAdminController(@Account() account: any) {
    return {
      success: true,
      data: await this.plansService.getAllForAdmin(account.id, account.role),
    };
  }

  @Get(':planId/user')
  @UseGuards(UserAuthGuard)
  async getPlanByIdForUserController(@Param('planId') planId: string) {
    return {
      success: true,
      data: await this.plansService.getById(planId),
    };
  }
  @Get(':planId/admin')
  @UseGuards(UserAuthGuard)
  async getPlanByIdForAdminController(
    @Param('planId') planId: string,
    @Account() account: any,
  ) {
    return {
      success: true,
      data: await this.plansService.getPlanByIdForAdmin(
        planId,
        account.role,
        account.id,
      ),
    };
  }
  @Get(':planId/guest')
  async getPlanByIdForGuestController(@Param('planId') planId: string) {
    return {
      success: true,
      data: await this.plansService.getById(planId),
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
