import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { UserService } from '../../user/user.service';
import { LocationsService } from '../../locations/services/locations.service';
import { WashingServicesService } from '../../washing-services/services/washing-services.service';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { PlansService } from '../../plans/services/plans.service';
import { OrderStatus, OrderTypes, Order } from '../schemas/orders.schema';
import { OrderCreationDTO } from '../dtos/OrderCreation.dto';
import { User } from '../../user/schemas/user.schema';
import { Location } from '../../locations/schemas/location.schema';
import { PaymentTypeUpdateDTO } from '../dtos/paymentTypeUpdate.dto';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';

@Injectable()
export class UsersOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private userService: UserService,
    private locationsService: LocationsService,
    private washingServicesService: WashingServicesService,
    private subscriptionsService: SubscriptionsService,
    private plansService: PlansService,
    private orderStatusValidator: OrderStatusValidator,
  ) {}

  async createOrder(userId: string, orderCreationDTO: OrderCreationDTO) {
    // Get User
    const user = await this.userService.getUserById(userId);

    // Set order location
    const location = await this.locationsService.createOrderLocationOrGetIt(
      user,
      this.locationObjectFormater(orderCreationDTO),
    );

    switch (orderCreationDTO.type) {
      case OrderTypes.SERVICE_BOOKING:
        return await this.createServicesOrder(user, orderCreationDTO, location);
      case OrderTypes.SUBSCRIPTION_BOOKING:
        return await this.createSubscriptionOrder(
          user,
          orderCreationDTO,
          location,
        );
    }
  }

  async createServicesOrder(
    user: User,
    orderCreationDTO: OrderCreationDTO,
    location: Location,
  ) {
    // Calculate totalDuration for washingServices
    const totalDuration =
      await this.washingServicesService.getTotalDurationForWashingServices(
        orderCreationDTO.washingServices,
      );

    const createdOrder = await this.ordersRepository.create(
      user,
      orderCreationDTO,
      location,
      totalDuration,
      OrderStatus.PENDING_USER_PAYMENT,
    );

    return {
      createdOrder,
      status: 'SET_PAYMENT_TYPE',
    };
  }

  async createSubscriptionOrder(
    user: User,
    orderCreationDTO: OrderCreationDTO,
    location: Location,
  ) {
    const userSubscription =
      await this.subscriptionsService.isUserHasSubscription(user);

    if (!userSubscription)
      throw new MethodNotAllowedResponse({
        ar: 'لا يوجد لديك اشتراكات',
        en: 'You Have No Subscription',
      });

    const plan = await this.plansService.getPlanById(userSubscription.plan);

    // Calculate totalDuration for washingServices
    const totalDuration =
      await this.washingServicesService.getTotalDurationForWashingServices([
        ...(orderCreationDTO.washingServices
          ? orderCreationDTO.washingServices
          : []),
        ...plan.washingServices,
      ]);

    const hasExtraServicesOrAddOns =
      this.isOrderHasExtraServicesOrAddOns(orderCreationDTO);

    const createdOrder = await this.ordersRepository.create(
      user,
      orderCreationDTO,
      location,
      totalDuration,
      hasExtraServicesOrAddOns
        ? OrderStatus.PENDING_USER_PAYMENT
        : OrderStatus.PENDING_USER_REVIEW,
    );

    await createdOrder.populate(this.ordersRepository.populatedPaths);

    createdOrder.user = undefined;

    return {
      createdOrder,
      status: createdOrder.totalPay ? 'SET_PAYMENT_TYPE' : 'ORDER_VIEW',
    };
  }

  isOrderHasExtraServicesOrAddOns(orderCreationDTO: OrderCreationDTO) {
    return orderCreationDTO.washingServices?.length ||
      orderCreationDTO.addOns?.length
      ? true
      : false;
  }

  locationObjectFormater(orderCreationDTO: OrderCreationDTO) {
    return {
      latitude: Number(orderCreationDTO.location.latitude),
      longitude: Number(orderCreationDTO.location.longitude),
      streetName: orderCreationDTO.location.streetName,
      subAdministrativeArea: orderCreationDTO.location.subAdministrativeArea,
      country: orderCreationDTO.location.country,
    };
  }

  async getAllUserOrders(userId: string, status?: OrderStatus) {
    // Get User
    const user = await this.userService.getUserById(userId);

    return await this.ordersRepository.findAllUserOrders(user);
  }

  async setOrderActive(order: string) {
    const pendingOrder = await this.ordersRepository.findOrderById(order);

    this.orderStatusValidator.isStatusValidForOrder(
      pendingOrder,
      OrderStatus.ACTIVE,
    );

    pendingOrder.status = OrderStatus.ACTIVE;
    await pendingOrder.save();
  }

  async setPaymentType(paymentTypeUpdateDTO: PaymentTypeUpdateDTO) {
    const order = await this.ordersRepository.findOrderById(
      paymentTypeUpdateDTO.order,
    );

    if (order.status === OrderStatus.PENDING_USER_REVIEW)
      throw new MethodNotAllowedResponse({
        ar: 'لا يوجد دفع في حالة اشتراكك في احدي باقتنا',
        en: 'There Is No Payment',
      });

    // update Payment Type
    order.paymentType = paymentTypeUpdateDTO.paymentType;
    await order.save();

    // Populate order
    await order.populate(this.ordersRepository.populatedPaths);

    order.user = undefined;

    return order;
  }

  async cancelOrderByUser(orderId: string) {
    const order = await this.ordersRepository.findOrderById(orderId);

    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.CANCELLED_BY_USER,
    );
    order.status = OrderStatus.CANCELLED_BY_USER;
    await order.save();
  }
}
