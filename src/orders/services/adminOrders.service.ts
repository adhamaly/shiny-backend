import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { AdminService } from 'src/admin/admin.service';
import { GetOrdersByAdminDTO } from '../dtos';
import { PaginationService } from 'src/common/services/pagination/pagination.service';
import { City } from 'src/city/schemas/city.schema';
import { Admin, Roles } from 'src/admin/schemas/admin.schema';
import { OrderStatusValidator } from '../validators/orderStatusValidator';
import { OrderStatus } from '../schemas/orders.schema';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { BikersService } from '../../bikers/services/bikers.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminsOrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private adminService: AdminService,
    private paginationService: PaginationService,
    private orderStatusValidator: OrderStatusValidator,
    private notificationService: NotificationsService,
    private bikerService: BikersService,
    private userService: UserService,
  ) {}

  /**
   * return -all orders (within cities if sub) /  all if super
   *        - and filter creteria
   */
  async getOrdersByAdmin(
    adminId: string,
    role: string,
    getOrdersByAdminQuery: GetOrdersByAdminDTO,
  ) {
    const { page = 1, perPage = 10, status } = getOrdersByAdminQuery;

    const { limit, skip } = this.paginationService.getSkipAndLimit(
      Number(page),
      Number(perPage),
    );

    let admin: Admin;
    if (role === Roles.SubAdmin)
      admin = await this.adminService.getById(adminId);

    const { orders, count } = await this.ordersRepository.findAllByAdmin(
      skip,
      limit,
      role,
      status,
      role === Roles.SubAdmin ? admin.city : [],
    );

    return this.paginationService.paginate(
      orders,
      count,
      Number(page),
      Number(perPage),
    );
  }

  /**
   *  Set order ACCEPTED_BY_BIKER - assignedBy:adminId - isAssigned:true
   * @param orderId
   * @param bikerId
   * @param adminId
   */
  async assignOrderToBikerByAdmin(
    orderId: string,
    bikerId: string,
    adminId: string,
  ) {
    const order = await this.ordersRepository.findOrderByIdOr404(orderId);
    // Check order status
    this.orderStatusValidator.isStatusValidForOrder(
      order,
      OrderStatus.ACCEPTED_BY_BIKER,
    );

    // Assign Order To Biker
    await this.ordersRepository.update(orderId, {
      assignedBy: adminId,
      isAssigned: true,
      status: OrderStatus.ACCEPTED_BY_BIKER,
      biker: bikerId,
    });

    const biker = await this.bikerService.getByIdOr404(bikerId);

    const userOfOrder = await this.userService.getUser(order.user.toString());

    // TODO: Send Notification to biker and user
    await this.notificationService.sendAdminAssignedOrderToBikerNotification(
      bikerId,
      biker.language,
      biker.fcmTokens,
      orderId,
    );

    await this.notificationService.sendOrderAcceptedByBikerNotificaiton(
      userOfOrder._id.toString(),
      userOfOrder.language || 'en',
      userOfOrder.fcmTokens,
      biker.userName,
      orderId,
      userOfOrder.isAllowNotification,
    );
  }

  /**
   * return -all orders (within cities if sub) /  all if super
   *        - and filter creteria
   */
  async getAssignedOrdersByAdmin(
    adminId: string,
    getOrdersByAdminQuery: GetOrdersByAdminDTO,
  ) {
    const { page = 1, perPage = 10 } = getOrdersByAdminQuery;

    const { limit, skip } = this.paginationService.getSkipAndLimit(
      Number(page),
      Number(perPage),
    );

    const { orders, count } =
      await this.ordersRepository.findAllAssignedByAdmin(skip, limit, adminId);

    return this.paginationService.paginate(
      orders,
      count,
      Number(page),
      Number(perPage),
    );
  }

  async getOrderById(orderId: string) {
    return await this.ordersRepository.findOrderWithCityByIdPopulatedOr404(
      orderId,
    );
  }
}
