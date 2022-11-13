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
import { Account } from 'src/common/decorators/user.decorator';

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
      data: await this.washingServicesService.getAll(account.id, account.role),
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
      ),
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
}
