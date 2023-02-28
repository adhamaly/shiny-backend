import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsAdminGaurd, UserAuthGuard } from 'src/auth/guards';
import { Account } from 'src/common/decorators/user.decorator';
import { GetOrdersByAdminDTO } from '../dtos';
import { AdminsOrdersService } from '../services/adminOrders.service';

@Controller('orders/admins')
export class AdminsOrdersController {
  constructor(private adminsOrdersService: AdminsOrdersService) {}

  //TODO: Add status[] in query if for listing with more than one status
  @Get('all')
  @UseGuards(UserAuthGuard, IsAdminGaurd)
  async getAllOrdersByAdminController(
    @Account() account: any,
    @Query() getOrdersByAdminQuery: GetOrdersByAdminDTO,
  ) {
    const ordersPagination = await this.adminsOrdersService.getOrdersByAdmin(
      account.id,
      account.role,
      getOrdersByAdminQuery,
    );
    return {
      success: true,
      pagination: ordersPagination.paginationData,
      data: ordersPagination.dataList,
    };
  }

  //TODO: Add bikerId in query if admin list assigned order to biker
  @Get('assigned')
  @UseGuards(UserAuthGuard, IsAdminGaurd)
  async ge(
    @Account() account: any,
    @Query() getOrdersByAdminQuery: GetOrdersByAdminDTO,
  ) {
    const assignedOrdersPagination =
      await this.adminsOrdersService.getAssignedOrdersByAdmin(
        account.id,
        getOrdersByAdminQuery,
      );
    return {
      success: true,
      pagination: assignedOrdersPagination.paginationData,
      data: assignedOrdersPagination.dataList,
    };
  }

  @Patch('/:orderId/assign-biker')
  @UseGuards(UserAuthGuard, IsAdminGaurd)
  async assignOrderByAdminController(
    @Account() account: any,
    @Param('orderId') orderId: string,
    @Body('bikerId') bikerId: string,
  ) {
    return {
      success: true,
      data: await this.adminsOrdersService.assignOrderToBikerByAdmin(
        orderId,
        bikerId,
        account.id,
      ),
    };
  }
}
