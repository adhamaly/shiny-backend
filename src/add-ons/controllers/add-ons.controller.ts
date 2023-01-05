import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddOnsService } from '../services/add-ons.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { CreateAddOnsDTO } from '../dtos/createAddOns.dto';
import { Account } from '../../common/decorators/user.decorator';
import { QueryParamsDTO } from '../dtos/add-ons-queryParams.dto';

@Controller('add-ons')
export class AddOnsController {
  constructor(private addOnsService: AddOnsService) {}

  @Post()
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async createAddOnsController(
    @Body() createAddOnsDTO: CreateAddOnsDTO,
    @Account() account: any,
  ) {
    await this.addOnsService.createAddOns(
      createAddOnsDTO,
      account.id,
      account.role,
    );

    return {
      success: true,
    };
  }

  @Get('/user/all')
  @UseGuards(UserAuthGuard)
  async getAllAddOnsesForUserController(
    @Query() queryParamsDTO: QueryParamsDTO,
    @Account() account: any,
  ) {
    const result = await this.addOnsService.getAllAddOnsForUser(
      account.id,
      queryParamsDTO,
    );

    return {
      success: true,
      message: result.message,
      data: result.addOnses,
    };
  }

  @Get('/guest/all')
  async getAllAddOnsesForGuestController(
    @Query() queryParamsDTO: QueryParamsDTO,
  ) {
    const result = await this.addOnsService.getAllAddOnsForGuest(
      queryParamsDTO,
    );

    return {
      success: true,
      message: result.message,
      data: result.addOnses,
    };
  }

  @Get('admin/all')
  @UseGuards(UserAuthGuard)
  async getAllAddOnsesForAdminController(@Account() account: any) {
    return {
      success: true,
      data: await this.addOnsService.getAllForAdmin(account.role, account.id),
    };
  }

  @Get('admin/details/:addOnsId')
  @UseGuards(UserAuthGuard)
  async getByIdForAdmin(@Param('addOnsId') addOnsId: string) {
    return {
      success: true,
      data: await this.addOnsService.getByIdOr404(addOnsId),
    };
  }
}
