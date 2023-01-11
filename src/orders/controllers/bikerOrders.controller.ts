import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { BikerOrdersService } from '../services/bikerOrders.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { Account } from 'src/common/decorators/user.decorator';
import { GetOrdersDTO } from '../dtos/getOrders.dto';

@Controller('orders/biker')
export class BikerOrdersController {
  constructor(private bikerOrdersService: BikerOrdersService) {}

  // @Get('')
  // @UseGuards(UserAuthGuard)
  // async getOrdersByStatusController(
  //   @Account() account: any,
  //   @Query() getOrdersDTO: GetOrdersDTO,
  // ) {
  //   /* TODO document why this async method 'getOrdersByStatusController' is empty */
  //   const result = await this.bikerOrdersService.getAllBikerOrders(
  //     account.id,
  //     getOrdersDTO,
  //   );
  //   return {
  //     success: true,
  //     totalPages: result.paginationData.totalPages,
  //     data: result.dataList,
  //   };
  // }

  @Patch('accept-order')
  @UseGuards(UserAuthGuard)
  async acceptOrderController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    /* TODO document why this async method 'acceptOrderController' is empty */
    await this.bikerOrdersService.acceptOrderByBiker(account.id, order);
    return {
      success: true,
    };
  }
  @Patch('on-the-way')
  @UseGuards(UserAuthGuard)
  async orderOnTheWayController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    /* TODO document why this async method 'bikerOnTheWayController' is empty */
    await this.bikerOrdersService.orderOnTheWay(account.id, order);
    return {
      success: true,
    };
  }
  @Patch('arrived')
  @UseGuards(UserAuthGuard)
  async bikerArrivedController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    /* TODO document why this async method 'bikerArrivedController' is empty */
    await this.bikerOrdersService.bikerArrived(account.id, order);

    return {
      success: true,
    };
  }
  @Patch('on-washing')
  @UseGuards(UserAuthGuard)
  async orderOnWashingController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    /* TODO document why this async method 'bikerOnWashingController' is empty */
    await this.bikerOrdersService.orderOnWashing(account.id, order);

    return {
      success: true,
    };
  }
  @Patch('completed')
  @UseGuards(UserAuthGuard)
  async orderCompletedController(
    @Account() account: any,
    @Body('order') order: string,
  ) {
    /* TODO document why this async method 'bikerCompleteOrderController' is empty */
    await this.bikerOrdersService.orderCompleted(account.id, order);

    return {
      success: true,
    };
  }
}