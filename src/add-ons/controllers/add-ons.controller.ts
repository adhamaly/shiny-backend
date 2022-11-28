import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AddOnsService } from '../services/add-ons.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../../admin/guard/isAdmin.guard';
import { CreateAddOnsDTO } from '../dtos/createAddOns.dto';
import { Account } from '../../common/decorators/user.decorator';
import { QueryParamsDTO } from '../dtos/add-ons-queryParams.dto';

@Controller('add-onses')
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

  @Get('/user')
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
      messsage: result.message,
      data: result.addOnses,
    };
  }
}
