import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderStatus } from '../schemas/orders.schema';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { GetOrdersDTO } from '../dtos/getOrders.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';
import { BikersService } from '../../bikers/services/bikers.service';

@Injectable()
export class BikerOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private orderGateway: OrderGateway,
    private orderStatusValidator: OrderStatusValidator,
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

    await this.orderGateway.orderAcceptedByBikerEventHandler(
      orderId,
      order.user,
    );
    // TODO: Send Notification to all bikers using fcmTokens
  }
  async orderOnTheWay(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ON_THE_WAY,
    );
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ON_THE_WAY,
    });
    // TODO: Emit order to user using socket streaming
    await this.orderGateway.orderOnTheWayEventHandler(orderId, order.user);
    // TODO: Send Notification to the user of order
  }

  async bikerArrived(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ARRIVED,
    );
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ARRIVED,
    });
    // TODO: Emit order to user using socket streaming
    await this.orderGateway.bikerArrivedEventHandler(orderId, order.user);
    // TODO: Send Notification to the user of order
  }
  async orderOnWashing(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.ON_WASHING,
    );
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.ON_WASHING,
    });
    // TODO: Emit order to user using socket streaming
    await this.orderGateway.orderOnWashingEventHandler(orderId, order.user);
    // TODO: Send Notification to the user of order
  }

  async orderCompleted(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.COMPLETED,
    );
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.COMPLETED,
    });
    // TODO: Emit order to user using socket streaming
    await this.orderGateway.orderCompletedEventHandler(orderId, order.user);
    // TODO: Send Notification to the user of order
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
