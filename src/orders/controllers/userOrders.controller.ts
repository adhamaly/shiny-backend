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
    @Query('status') status: OrderStatus,
  ) {
    return {
      success: true,
      data: await this.usersOrdersService.getAllUserOrders(account.id, status),
    };
  }

  @Get('order-details/:orderId')
  @UseGuards(UserAuthGuard)
  async getOrderByIdController(@Param('orderId') orderId: string) {
    return {
      success: true,
      data: await this.usersOrdersService.getOrderById(orderId),
    };
  }
}
