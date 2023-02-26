import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderStatus } from '../schemas/orders.schema';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { GetOrdersDTO } from '../dtos/getOrders.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';
import { BikersService } from '../../bikers/services/bikers.service';
import { LocationsService } from '../../locations/services/locations.service';
import { AcceptOrderDTO } from '../dtos/acceptOrder.dto';
import { UserService } from '../../user/user.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class BikerOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private orderGateway: OrderGateway,
    private orderStatusValidator: OrderStatusValidator,
    private paginationService: PaginationService,
    private bikersService: BikersService,
    private locationsService: LocationsService,
    private userService: UserService,
    private notificationsService: NotificationsService,
  ) {}

  async acceptOrderByBiker(bikerId: string, acceptOrderDTO: AcceptOrderDTO) {
    const order = await this.ordersRepository.findOrderByIdOr404(
      acceptOrderDTO.order,
    );

    const userOfOrder = await this.userService.getUser(order.user);

    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.ACCEPTED_BY_BIKER,
    );

    const biker = await this.bikersService.updateBikerLocation(bikerId, {
      latitude: Number(acceptOrderDTO.latitude),
      longitude: Number(acceptOrderDTO.longitude),
      subAdministrativeArea: acceptOrderDTO.subAdministrativeArea,
      streetName: acceptOrderDTO.streetName,
    });

    await this.ordersRepository.update(acceptOrderDTO.order, {
      biker: bikerId,
      status: OrderStatus.ACCEPTED_BY_BIKER,
    });

    await this.orderGateway.orderAcceptedByBikerEventHandler(
      acceptOrderDTO.order,
      order.user,
    );

    await this.notificationsService.sendOrderAcceptedByBikerNotificaiton(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      biker.userName,
      acceptOrderDTO.order,
    );
  }

  async orderOnTheWay(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ON_THE_WAY,
    );
    const userOfOrder = await this.userService.getUser(order.user);

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ON_THE_WAY,
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.orderOnTheWayEventHandler(orderId, order.user);

    //  Send Notification to the user of order
    await this.notificationsService.sendBikerOnTheWayNotificaiton(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
    );
  }

  async bikerArrived(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ARRIVED,
    );
    const userOfOrder = await this.userService.getUser(order.user);

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ARRIVED,
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.bikerArrivedEventHandler(orderId, order.user);

    //  Send Notification to the user of order
    await this.notificationsService.sendBikerArrivedNotification(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
    );
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
    // Emit order to user using socket streaming
    await this.orderGateway.orderOnWashingEventHandler(orderId, order.user);
  }

  async orderCompleted(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.COMPLETED,
    );

    const userOfOrder = await this.userService.getUser(order.user);

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.COMPLETED,
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.orderCompletedEventHandler(orderId, order.user);

    //  Send Notification to the user of order
    await this.notificationsService.sendOrderCompletedNotification(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
    );
  }

  //FIXME: Check locations valid for query
  async getAllBikerOrders(bikerId: string, getOrdersDTO: GetOrdersDTO) {
    const biker = await this.bikersService.getById(bikerId);
    const { skip, limit } = this.paginationService.getSkipAndLimit(
      Number(getOrdersDTO.page),
      Number(getOrdersDTO.perPage),
    );

    const locations = await this.locationsService.getAllLocationsInCity(
      biker.city,
    );

    const { orders, count } = await this.ordersRepository.findAllBikerOrders(
      bikerId,
      getOrdersDTO.status,
      skip,
      limit,
      locations,
    );

    return this.paginationService.paginate(
      orders,
      count,
      Number(getOrdersDTO.page),
      Number(getOrdersDTO.perPage),
    );
  }
}
