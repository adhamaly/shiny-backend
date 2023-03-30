import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderGateway } from '../gateway/order.gateway';
import { Order, OrderStatus } from '../schemas/orders.schema';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { GetOrdersDTO } from '../dtos/getOrders.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';
import { BikersService } from '../../bikers/services/bikers.service';
import { LocationsService } from '../../locations/services/locations.service';
import { AcceptOrderDTO } from '../dtos/acceptOrder.dto';
import { UserService } from '../../user/user.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { MethodNotAllowedResponse } from 'src/common/errors';
import { User } from 'src/user/schemas/user.schema';
import { ForbiddenResponse } from 'src/common/errors/ForbiddenResponse';

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

    const userOfOrder = await this.userService.getUser(order.user.toString());

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
      order.user.toString(),
    );

    await this.notificationsService.sendOrderAcceptedByBikerNotificaiton(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      biker.userName,
      acceptOrderDTO.order,
      userOfOrder.isAllowNotification,
    );
  }

  async orderOnTheWay(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ON_THE_WAY,
    );
    const userOfOrder = await this.userService.getUser(order.user.toString());

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ON_THE_WAY,
      OnTheWayAt: new Date(),
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.orderOnTheWayEventHandler(
      orderId,
      order.user.toString(),
    );

    //  Send Notification to the user of order
    await this.notificationsService.sendBikerOnTheWayNotificaiton(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
      userOfOrder.isAllowNotification,
    );
  }

  async bikerArrived(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.BIKER_ARRIVED,
    );
    const userOfOrder = await this.userService.getUser(order.user.toString());

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.BIKER_ARRIVED,
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.bikerArrivedEventHandler(
      orderId,
      order.user.toString(),
    );

    //  Send Notification to the user of order
    await this.notificationsService.sendBikerArrivedNotification(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
      userOfOrder.isAllowNotification,
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
      onWashingAt: new Date(),
    });
    // Emit order to user using socket streaming
    await this.orderGateway.orderOnWashingEventHandler(
      orderId,
      order.user.toString(),
    );
  }

  async orderCompleted(bikerId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.COMPLETED,
    );

    const userOfOrder = await this.userService.getUser(order.user.toString());

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.COMPLETED,
      endTime: new Date().toISOString(),
    });
    //  Emit order to user using socket streaming
    await this.orderGateway.orderCompletedEventHandler(
      orderId,
      order.user.toString(),
    );

    //  Send Notification to the user of order
    await this.notificationsService.sendOrderCompletedNotification(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      order._id.toString(),
      userOfOrder.isAllowNotification,
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
  async rateUser(bikerId: string, orderId: string, starsNum: number) {
    // Check order status
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);

    //  Check access authorization for biker
    if (order.biker.toString() != bikerId)
      throw new ForbiddenResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    //  Check rating applied by biker for same order
    if (order.ratingOfUser)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    if (order.status !== OrderStatus.COMPLETED)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    // rate user
    order.ratingOfUser = starsNum;
    await order.save();

    const { average } = await this.calculateAverageRateForUser(order.user);

    // update user average rating
    const user = await this.userService.getUser(order.user.toString());

    user.rating = Number(average);
    await user.save();
  }

  private async calculateAverageRateForUser(userId: string | User) {
    const listOfRate = await this.ordersRepository.getUserRatedOrders(userId);
    const count: number = listOfRate.length;
    const sumOfRate = listOfRate.reduce(
      (prev: number, curr: Order) => prev + curr.ratingOfUser,
      0,
    );
    const avg = sumOfRate / count;

    const avgTwoDecimal = Number(avg.toFixed(0));

    return { average: avgTwoDecimal };
  }
}
