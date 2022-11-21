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
import { CreateWashingServiceDTO, UpdateWashingServiceDTO } from '../dtos';
import { WashingServicesService } from '../services/washing-services.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { City } from '../../city/schemas/city.schema';
import { WashingService } from '../schemas/washing-services.schema';
import { Account } from '../../common/decorators/user.decorator';

@Controller('washing-services')
export class WashingServicesController {
  constructor(private washingServicesService: WashingServicesService) {}

  @Post('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async createWashingServiceController(
    @Body() createWashingServiceDTO: CreateWashingServiceDTO,
  ) {
    await this.washingServicesService.createWashingService(
      createWashingServiceDTO,
    );

    return {
      success: true,
    };
  }

  @Get('')
  @UseGuards(UserAuthGuard)
  async getAllWashingServicesController(@Account() account: any) {
    return {
      success: true,
      data: await this.washingServicesService.getAll(account.role, account.id),
    };
  }

  @Get(':washingServiceId')
  @UseGuards(UserAuthGuard)
  async getByIdController(
    @Param('washingServiceId') washingServiceId: string,
    @Account() account: any,
  ) {
    return {
      success: true,
      data: await this.washingServicesService.getByIdOr404(
        washingServiceId,
        account.role,
        account.id,
      ),
    };
  }

  @Put(':washingServiceId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async updateController(
    @Param('washingServiceId') washingServiceId: string,
    @Body() updateWashingServiceDTO: UpdateWashingServiceDTO,
  ) {
    return {
      success: true,
      data: await this.washingServicesService.update(
        washingServiceId,
        updateWashingServiceDTO,
      ),
    };
  }

  @Post('/services-cities')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async addWashingServiceToNewCityController(
    @Body('washingService') washingService: WashingService,
    @Body('city') city: City,
  ) {
    // TODO:
    await this.washingServicesService.addWashingServiceToNewCity(
      washingService,
      city,
    );

    return {
      success: true,
    };
  }
  @Delete('/services-cities')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async deleteWashingServiceFromCityController(
    @Body('washingService') washingService: WashingService,
    @Body('city') city: City,
  ) {
    // TODO:
    await this.washingServicesService.deleteWashingServiceFromCity(
      washingService,
      city,
    );

    return {
      success: true,
    };
  }

  @Put('/services-cities/archive')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async archiveWashingServiceFromCityController(
    @Body('washingService') washingService: WashingService,
    @Body('city') city: City,
  ) {
    // TODO:
    await this.washingServicesService.archiveWashingServiceFromCity(
      washingService,
      city,
    );

    return {
      success: true,
    };
  }

  @Put('/services-cities/activate')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async activateWashingServiceFromCityController(
    @Body('washingService') washingService: WashingService,
    @Body('city') city: City,
  ) {
    // TODO:
    await this.washingServicesService.activateWashingServiceFromCity(
      washingService,
      city,
    );

    return {
      success: true,
    };
  }
}
