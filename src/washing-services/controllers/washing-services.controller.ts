import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateWashingServiceDTO } from '../dtos';
import { WashingServicesService } from '../services/washing-services.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';

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
  async getAllWashingServicesController() {
    return {
      success: true,
      data: await this.washingServicesService.getAll(),
    };
  }

  @Get(':washingServiceId')
  @UseGuards(UserAuthGuard)
  async getByIdController(@Param('washingServiceId') washingServiceId: string) {
    return {
      success: true,
      data: await this.washingServicesService.getByIdOr404(washingServiceId),
    };
  }

  @Put(':washingServiceId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async updateController(
    @Param('washingServiceId') washingServiceId: string,
    @Body() createWashingServiceDTO: CreateWashingServiceDTO,
  ) {
    await this.washingServicesService.update(
      washingServiceId,
      createWashingServiceDTO,
    );
    return {
      success: true,
    };
  }
  @Put(':washingServiceId/activate')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async activateWashingServiceController(
    @Param('washingServiceId') washingServiceId: string,
  ) {
    await this.washingServicesService.activate(washingServiceId);

    return {
      success: true,
    };
  }
  @Put(':washingServiceId/archive')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async archiveWashingServiceController(
    @Param('washingServiceId') washingServiceId: string,
  ) {
    await this.washingServicesService.archive(washingServiceId);

    return {
      success: true,
    };
  }
}
