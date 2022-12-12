import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PromoCodesService } from '../services/promo-code.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { CreatePromoCodeDTO } from '../dtos/createPromoCode.dto';
import { Account } from 'src/common/decorators/user.decorator';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async createPromoCodeController(
    @Body() createPromoCodeDTO: CreatePromoCodeDTO,
  ) {
    await this.promoCodesService.createPromoCode(createPromoCodeDTO);
    return {
      success: true,
    };
  }

  @Get('user')
  @UseGuards(UserAuthGuard)
  async getAllForUserController(@Query('status') status: string) {
    return {
      success: true,
      data: await this.promoCodesService.getAllForUser(status),
    };
  }
}
