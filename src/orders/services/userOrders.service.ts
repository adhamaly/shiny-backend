import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { UserService } from '../../user/user.service';
import { LocationsService } from '../../locations/services/locations.service';
import { WashingServicesService } from '../../washing-services/services/washing-services.service';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { PlansService } from '../../plans/services/plans.service';
import {
  OrderStatus,
  OrderTypes,
  Order,
  PaymentTypes,
} from '../schemas/orders.schema';
import { OrderCreationDTO } from '../dtos/OrderCreation.dto';
import { User } from '../../user/schemas/user.schema';
import { Location } from '../../locations/schemas/location.schema';
import { PaymentTypeUpdateDTO } from '../dtos/paymentTypeUpdate.dto';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { PromoCodesService } from '../../promo-code/services/promo-code.service';
import { PromoCode } from '../../promo-code/schemas/promo-code.schema';
import { GetOrdersDTO } from '../dtos/getOrders.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';

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
    private PromoCodesService: PromoCodesService,
    private paginationService: PaginationService,
  ) {}

  async createOrder(userId: string, orderCreationDTO: OrderCreationDTO) {
    // Get User
    const user = await this.userService.getUserById(userId);

    // Set order location
    const location = await this.locationsService.createOrderLocationOrGetIt(
      user,
      this.locationObjectFormater(orderCreationDTO),
    );

    if (!orderCreationDTO.paymentType)
      throw new MethodNotAllowedResponse({
        ar: 'قم باختيار طريقة الدفع صالحة',
        en: 'Choose Valid Payment Type',
      });

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
    this.paymentTypeValidator(orderCreationDTO.paymentType);
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

    await createdOrder.populate(this.ordersRepository.populatedPaths);

    createdOrder.user = undefined;

    return createdOrder;
  }

  paymentTypeValidator(paymentType: string) {
    if (!paymentType)
      throw new MethodNotAllowedResponse({
        ar: 'قم باختيار طريقة الدفع',
        en: 'Choose Payment Type',
      });

    if (
      paymentType !== PaymentTypes.CREDIT &&
      paymentType !== PaymentTypes.WALLET &&
      paymentType !== PaymentTypes.SUBSCRIBED
    )
      throw new MethodNotAllowedResponse({
        ar: 'قم باختيار طريقة الدفع صالحة',
        en: 'Choose Valid Payment Type',
      });
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

    if (!userSubscription.remainingWashes)
      throw new MethodNotAllowedResponse({
        ar: 'لقد بلغت الحد الاقصي للاستخدام من الباقة',
        en: 'You Have No Remaining Washes',
      });

    const hasExtraServicesOrAddOns =
      this.isOrderHasExtraServicesOrAddOns(orderCreationDTO);

    if (hasExtraServicesOrAddOns)
      this.paymentTypeValidator(orderCreationDTO.paymentType);

    const plan = await this.plansService.getPlanById(userSubscription.plan);

    // Calculate totalDuration for washingServices
    const totalDuration =
      await this.washingServicesService.getTotalDurationForWashingServices([
        ...(orderCreationDTO.washingServices
          ? orderCreationDTO.washingServices
          : []),
        ...plan.washingServices,
      ]);

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

    return createdOrder;
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

  async getAllUserOrders(userId: string, getOrdersDTO: GetOrdersDTO) {
    // Get User
    const user = await this.userService.getUserById(userId);

    const { skip, limit } = this.paginationService.getSkipAndLimit(
      Number(getOrdersDTO.page),
      Number(getOrdersDTO.perPage),
    );
    const { orders, count } = await this.ordersRepository.findAllUserOrders(
      user,
      getOrdersDTO.status,
      skip,
      limit,
    );

    return this.paginationService.paginate(
      orders,
      count,
      Number(getOrdersDTO.page),
      Number(getOrdersDTO.perPage),
    );
  }

  async getOrderById(orderId: string) {
    return await this.ordersRepository.findOrderByIdPopulatedOr404(orderId);
  }

  async cancelOrderByUser(orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);

    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.CANCELLED_BY_USER,
    );
    order.status = OrderStatus.CANCELLED_BY_USER;
    await order.save();
  }

  async applyPromoCodeForOrder(userId: string, orderId: string, code: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    const user = await this.userService.getUserById(userId);
    const promoCode = await this.PromoCodesService.getByCode(code);

    if (!promoCode)
      throw new MethodNotAllowedResponse({
        ar: 'لا يوجد هذا الكود',
        en: 'Promo Code Not Exist',
      });

    if (order.paymentType === PaymentTypes.WALLET)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك استخدام مع المحفظة الإلكترونية ',
        en: 'You could not Promo Code with wallet',
      });

    await this.PromoCodesService.apply(user, promoCode);

    const { totalPayAfterDiscount, discountAmount } =
      this.getTotalPayAfterPromoCode(promoCode, order);

    const updatedOrder = await this.ordersRepository.update(orderId, {
      totalPay: totalPayAfterDiscount,
      promoCode: promoCode,
      discount: discountAmount,
    });

    await updatedOrder.populate(this.ordersRepository.populatedPaths);

    updatedOrder.user = undefined;

    return {
      _id: updatedOrder._id,
      discount: updatedOrder.discount,
      totalPay: updatedOrder.totalPay,
      totalPrice: updatedOrder.totalPrice,
    };
  }
  getTotalPayAfterPromoCode(promoCode: PromoCode, order: Order) {
    const totalPay = order.totalPay;
    const discountPercentage = promoCode.discountPercentage / 100;
    const discountAmount = totalPay * discountPercentage;
    const totalPayAfterDiscount = totalPay - discountAmount;

    return { totalPayAfterDiscount, discountAmount };
  }
  async payOrder(userId: string, orderId: string) {
    const pendingOrder = await this.ordersRepository.findOrderByIdOr404(
      orderId,
    );

    this.orderStatusValidator.isStatusValidForOrder(
      pendingOrder,
      OrderStatus.ACTIVE,
    );

    this.paymentTypeValidator(pendingOrder.paymentType);

    switch (pendingOrder.paymentType) {
      case PaymentTypes.CREDIT:
        await this.payCredit(orderId);
        return;

      case PaymentTypes.WALLET:
        await this.payWallet(userId, orderId);
        return;

      case PaymentTypes.SUBSCRIBED:
        await this.paySubscribedOrder(orderId);
        return;

      default:
        return;
    }
  }

  async payCredit(orderId: string) {
    const pendingOrder = await this.ordersRepository.findOrderByIdOr404(
      orderId,
    );

    if (pendingOrder.paymentType !== PaymentTypes.CREDIT)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك الدفع ',
        en: 'You could not pay',
      });

    // TODO: Add Payment Service

    if (
      pendingOrder.type === OrderTypes.SUBSCRIPTION_BOOKING ||
      pendingOrder.subscription
    ) {
      await this.subscriptionsService.decrementUserRemainigWashes(
        pendingOrder.subscription,
      );
    }

    // pay order
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.ACTIVE,
    });
  }
  async payWallet(userId: string, orderId: string) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    const user = await this.userService.getUserById(userId);

    if (
      order.discount ||
      order.promoCode ||
      order.paymentType !== PaymentTypes.WALLET
    )
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك الدفع بالمحفظة',
        en: 'You could not pay using wallet',
      });

    const IsUserWalletBalanceValid = this.userService.checkWalletBalanceValid(
      user,
      order.totalPrice,
    );
    if (!IsUserWalletBalanceValid)
      throw new MethodNotAllowedResponse({
        ar: 'لا تحتوي محفظتك الإلكترونية علي هذا المبلغ',
        en: 'Your Wallet Balance Is Not Valid',
      });

    if (order.type === OrderTypes.SUBSCRIPTION_BOOKING || order.subscription) {
      await this.subscriptionsService.decrementUserRemainigWashes(
        order.subscription,
      );
    }

    // Decrement wallet from user
    await this.userService.payWithWallet(userId, order.totalPrice);

    await this.ordersRepository.update(orderId, {
      status: OrderStatus.ACTIVE,
    });
  }

  async paySubscribedOrder(orderId: string) {
    const pendingOrder = await this.ordersRepository.findOrderByIdOr404(
      orderId,
    );

    if (pendingOrder.paymentType !== PaymentTypes.SUBSCRIBED)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك الدفع ',
        en: 'You could not pay',
      });

    await this.subscriptionsService.decrementUserRemainigWashes(
      pendingOrder.subscription,
    );

    // pay order
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.ACTIVE,
    });
  }
  getTotalPayAfterWallet(order: Order, walletAmount: number) {
    return order.totalPay - walletAmount;
  }
}
