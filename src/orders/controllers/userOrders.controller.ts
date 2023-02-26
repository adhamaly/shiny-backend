import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { OrderCreationDTO, PaymentTypeUpdateDTO } from '../dtos';
import { UsersOrdersService } from '../services/userOrders.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { OrderStatus, OrderTypes } from '../schemas/orders.schema';
import { GetOrdersDTO } from '../dtos/getOrders.dto';

@Controller('orders/user')
export class UserOrdersController {
  constructor(private usersOrdersService: UsersOrdersService) {}

  @Post('create-order')
  @UseGuards(UserAuthGuard)
  async createServicesOrderController(
    @Account() account: any,
    @Body() orderCreationDTO: OrderCreationDTO,
  ) {
    return {
      success: true,
      data: await this.usersOrdersService.createOrder(
        account.id,
        orderCreationDTO,
      ),
    };
  }

  @Patch('pay-order')
  @UseGuards(UserAuthGuard)
  async setOrderActiveController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    await this.usersOrdersService.payOrder(account.id, order);
    // Start the timer for change status
    setTimeout(async () => {
      console.log('Check Order Status Timer Run');

      await this.usersOrdersService.checkOrderAfterMins(order, account.id);
    }, 5 * 60 * 1000);
    return {
      success: true,
    };
  }

  @Patch('cancel-order')
  @UseGuards(UserAuthGuard)
  async cancelOrderController(@Body('order') order: string) {
    await this.usersOrdersService.cancelOrderByUser(order);
    return {
      success: true,
    };
  }

  @Patch('apply-promo-code')
  @UseGuards(UserAuthGuard)
  async applyPromoCodeController(
    @Account() account: any,
    @Body('order') order: string,
    @Body('code') code: string,
  ) {
    return {
      success: true,
      data: await this.usersOrdersService.applyPromoCodeForOrder(
        account.id,
        order,
        code,
      ),
    };
  }

  @Get('all')
  @UseGuards(UserAuthGuard)
  async getAllUserOrdersController(
    @Account() account: any,
    @Query() getOrdersDTO: GetOrdersDTO,
  ) {
    const ordersResult = await this.usersOrdersService.getAllUserOrders(
      account.id,
      getOrdersDTO,
    );
    return {
      success: true,
      totalPages: ordersResult.paginationData.totalPages,
      totalItems: ordersResult.paginationData.totalItems,
      data: ordersResult.dataList,
    };
  }

  @Get('order-details/:orderId')
  @UseGuards(UserAuthGuard)
  async getOrderByIdController(@Param('orderId') orderId: string) {
    return {
      success: true,
      data: await this.usersOrdersService.getOrderByIdPopulated(orderId),
    };
  }
}
