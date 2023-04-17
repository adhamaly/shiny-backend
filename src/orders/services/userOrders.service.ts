import { Inject, Injectable, forwardRef } from '@nestjs/common';
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
import { OrderGateway } from '../gateway/order.gateway';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { AdminService } from 'src/admin/admin.service';
import { BikersService } from 'src/bikers/services/bikers.service';
import { Biker } from 'src/bikers/schemas/bikers.schema';
import { ForbiddenResponse } from 'src/common/errors/ForbiddenResponse';
import { PointService } from 'src/points/services/point.service';

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
    @Inject(forwardRef(() => OrderGateway))
    private orderGateway: OrderGateway,
    private notificationService: NotificationsService,
    private adminService: AdminService,
    private bikersService: BikersService,
    private pointService: PointService,
  ) {}

  //FIXME: Check order creation for order with subscription plan only
  async createOrder(userId: string, orderCreationDTO: OrderCreationDTO) {
    // Get User
    const user = await this.userService.getUserById(userId);

    if (!orderCreationDTO.paymentType)
      throw new MethodNotAllowedResponse({
        ar: 'قم باختيار طريقة الدفع صالحة',
        en: 'Choose Valid Payment Type',
      });

    if (orderCreationDTO.paymentType === PaymentTypes.WALLET) {
      // check Wallet For user
      const IsUserWalletBalanceValid = this.userService.checkWalletBalanceValid(
        user,
        orderCreationDTO.totalPrice,
      );
      if (!IsUserWalletBalanceValid)
        throw new MethodNotAllowedResponse({
          ar: 'لا تحتوي محفظتك الإلكترونية علي هذا المبلغ',
          en: 'Your Wallet Balance Is Not Valid',
        });
    }

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
      orderCreationDTO.washingServices,
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
      [
        ...(orderCreationDTO.washingServices
          ? orderCreationDTO.washingServices
          : []),
        ...plan.washingServices,
      ],
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

  async getOrderByIdPopulated(orderId: string) {
    return await this.ordersRepository.findOrderByIdPopulatedOr404(orderId);
  }

  async getOrderById(orderId: string) {
    return await this.ordersRepository.findOrderByIdOr404(orderId);
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

  async applyUserPoints(userId: string, orderId: string) {
    const user = await this.userService.getUserById(userId);

    await this.isCurrentPointsValidForRedeem(user.points);

    const order = await this.ordersRepository.findOrderByIdOr404(orderId);

    const newTotalPay = await this.getTotalPayAfterPointsApplied(
      user.points,
      order.totalPay,
    );

    const updatedOrder = await this.ordersRepository.update(orderId, {
      totalPay: newTotalPay,
    });

    await updatedOrder.populate(this.ordersRepository.populatedPaths);

    updatedOrder.user = undefined;

    return {
      _id: updatedOrder._id,
      totalPay: updatedOrder.totalPay,
      totalPrice: updatedOrder.totalPrice,
    };
  }
  async getTotalPayAfterPointsApplied(points: number, totalPay: number) {
    const pointsExchange = await this.pointService.calculatePointsExchange(
      points,
    );
    return totalPay - pointsExchange;
  }

  async isCurrentPointsValidForRedeem(points: number) {
    const redeemLimit = (await this.pointService.getPointsSystem()).redeemLimit;
    if (points < redeemLimit)
      throw new MethodNotAllowedResponse({
        ar: `الحد الادني من عدد النقاط للاستخدام ${redeemLimit}`,
        en: 'You must exceeds the redeem limit',
      });
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
        break;

      case PaymentTypes.WALLET:
        await this.payWallet(userId, orderId);
        break;

      case PaymentTypes.SUBSCRIBED:
        await this.paySubscribedOrder(orderId);
        break;

      default:
        break;
    }
  }

  async checkOrderAfterMins(orderId: string, userId: string) {
    const order = await this.ordersRepository.findOrderByIdPopulatedOr404(
      orderId,
    );
    if (order.status === OrderStatus.ACTIVE) {
      await this.ordersRepository.update(orderId, {
        status: OrderStatus.WAITING_FOR_BIKER_BY_ADMIN,
      });

      const user = await this.userService.getUser(userId);

      const adminsIds = await this.adminService.getAllAdminInCity(
        order.location.city,
      );

      await this.notificationService.sendPendingOrderToAdminNotification(
        adminsIds,
        orderId,
      );

      await this.notificationService.sendOrderUnderReviewNotification(
        userId,
        user.language || 'en',
        user.fcmTokens,
        orderId,
        user.isAllowNotification,
      );
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

    if (
      pendingOrder.type === OrderTypes.SUBSCRIPTION_BOOKING ||
      pendingOrder.subscription
    ) {
      await this.subscriptionsService.decrementUserRemainigWashes(
        pendingOrder.subscription,
      );
    }

    // TODO: Setting order paid is after webhooks successed
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.ACTIVE,
    });

    // TODO: Setting Points reward is after webhooks successed
    const pointsToBeRewards = await this.pointService.calculateEarningPoints(
      pendingOrder.totalPay,
    );

    await this.userService.userPointsUpgrade(
      String(pendingOrder.user),
      pointsToBeRewards,
    );

    await this.orderGateway.orderPublishedEventHandler(orderId);

    // TODO: Add Payment Service
  }
  //TODO: Use Transactions to update user+subscription+order
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

    await this.orderGateway.orderPublishedEventHandler(orderId);
  }

  //TODO: Use Transactions to update subscription+order
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

    await this.orderGateway.orderPublishedEventHandler(orderId);
  }
  getTotalPayAfterWallet(order: Order, walletAmount: number) {
    return order.totalPay - walletAmount;
  }

  async getOrderByQuery(query: any) {
    return await this.ordersRepository.findOneQuery(query);
  }
  async getOrdersByQuery(query: any) {
    return await this.ordersRepository.findManyQuery(query);
  }

  async rateBiker(userId: string, orderId: string, starsNum: number) {
    // Check order status
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);

    //  Check order authorization
    if (order.user.toString() !== userId)
      throw new ForbiddenResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    //  Check rating applied by user for same order
    if (order.ratingOfBiker)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    if (order.status !== OrderStatus.COMPLETED)
      throw new MethodNotAllowedResponse({
        ar: 'لا يمكنك اجراء التقييم',
        en: 'You Can Not Rate Biker',
      });

    // rate biker
    order.ratingOfBiker = starsNum;
    await order.save();

    const { average } = await this.calculateAverageRateForBiker(order.biker);
    // update biker average rating
    const biker = await this.bikersService.getById(order.biker);
    biker.rating = average;
    await biker.save();
  }

  private async calculateAverageRateForBiker(bikerId: string | Biker) {
    const listOfRate = await this.ordersRepository.getBikerRatedOrders(bikerId);
    const count: number = listOfRate.length;
    const sumOfRate = listOfRate.reduce(
      (prev: number, curr: Order) => prev + curr.ratingOfBiker,
      0,
    );
    const avg = sumOfRate / count;

    const avgTwoDecimal = Number(avg.toFixed(0));

    return { average: avgTwoDecimal };
  }
}
