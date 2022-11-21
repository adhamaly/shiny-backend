import { Controller, Get, Query } from '@nestjs/common';
import { QueryParamsDTO } from './dtos/queryParams.dto';
import { GuestService } from './guest.service';

@Controller('guest')
export class GuestControllers {
  constructor(private guestService: GuestService) {}

  @Get('washing-services')
  async getWashingServicesController(@Query() queryParamsDTO: QueryParamsDTO) {
    return {
      success: true,
      data: await this.guestService.getAllWashingServices(
        Number(queryParamsDTO.latitude),
        Number(queryParamsDTO.longitude),
      ),
    };
  }

  @Get('plans')
  async getPlansController(@Query() queryParamsDTO: QueryParamsDTO) {
    return {
      success: true,
      data: await this.guestService.getAllPlans(
        Number(queryParamsDTO.latitude),
        Number(queryParamsDTO.longitude),
      ),
    };
  }
}
