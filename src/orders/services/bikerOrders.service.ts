import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderStatus } from '../schemas/orders.schema';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { GetOrdersDTO } from '../dtos/getOrders.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';
import { BikersService } from '../../bikers/bikers.service';

@Injectable()
export class BikerOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private orderGateway: OrderGateway,
    private orderStatusValidator: OrderStatusValidator,
    private paginationService: PaginationService,
    private bikersService: BikersService,
  ) {}

  async acceptOrderByBiker(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.ACCEPTED_BY_BIKER,
    );
    await this.ordersRepository.update(orderId, {
      biker: bikerId,
      status: OrderStatus.ACCEPTED_BY_BIKER,
    });

    await this.orderGateway.orderAcceptedByBikerHandler(orderId, order.user);
  }

  // async getAllBikerOrders(bikerId: string, getOrdersDTO: GetOrdersDTO) {
  //   const biker = await this.bikersService.getById(bikerId);
  //   const { skip, limit } = this.paginationService.getSkipAndLimit(
  //     Number(getOrdersDTO.page),
  //     Number(getOrdersDTO.perPage),
  //   );
  //   const { orders, count } = await this.ordersRepository.findAllBikerOrders(
  //     bikerId,
  //     biker.city,
  //     getOrdersDTO.status,
  //     skip,
  //     limit,
  //   );

  //   return this.paginationService.paginate(
  //     orders,
  //     count,
  //     Number(getOrdersDTO.page),
  //     Number(getOrdersDTO.perPage),
  //   );
  // }
}
