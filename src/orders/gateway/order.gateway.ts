import { Inject, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';
import { UnAuthorizedResponse } from '../../common/errors/UnAuthorizedResponse';
import { UsersOrdersService } from '../services/userOrders.service';
import { BikersService } from '../../bikers/services/bikers.service';
import { LocationsService } from '../../locations/services/locations.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/schemas/user.schema';
import { Order } from '../schemas/orders.schema';

@WebSocketGateway()
export class OrderGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => UsersOrdersService))
    private usersOrdersService: UsersOrdersService,
    private bikersService: BikersService,
    private userService: UserService,
  ) {}
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('OrderGateway');

  onModuleInit() {
    this.logger.log('WebSocket Initialized ...');
  }

  handleDisconnect(socket: Socket) {
    console.log(socket.id);
    socket.disconnect();
  }
  async handleConnection(socket: Socket, ...args: any[]) {
    const userPayload = this.authService.authenticateSocketUser(socket);
    if (!userPayload?.id) return;
    const user = await this.authService.getUserByIdAndRole(
      userPayload.id,
      userPayload.role,
    );
    if (user) {
      // Inject user into socket
      socket.data.user = user;
      // Update SocketId
      await this.authService.updateUserSocketId(
        userPayload.id,
        userPayload.role,
        socket.id,
      );
    } else {
      this.disconnect(socket);
    }
  }
  private disconnect(socket: Socket) {
    socket.disconnect();
  }

  async orderPublishedEventHandler(order: string) {
    const publishedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    // Get All Online Bikers
    const onlineBikers =
      await this.bikersService.getAllOnlineBikersForOrderLocation(
        publishedOrder.location.city,
      );
    console.log('online Bikers -', onlineBikers);

    // Send Order to All of them
    for (const biker of onlineBikers) {
      this.server.to(biker.socketId).emit('order:published', publishedOrder);
    }
  }

  orderFormaterForUser(event: string, order: any) {
    return {
      success: true,
      _id: order._id,
      status: order.status,
      ...(event === 'order:accepted'
        ? { biker: { ...order.toObject().biker, rating: 3.6 } }
        : {}),
      ...(event === 'order:arrived'
        ? { duration: order.totalDuration }
        : { time: order.updatedAt }),
    };
  }
  async orderAcceptedByBikerEventHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const acceptedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    const formatedOrder = this.orderFormaterForUser(
      'order:accepted',
      acceptedOrder,
    );
    this.server.to(listenerUser.socketId).emit('order:accepted', formatedOrder);
  }
  async orderOnTheWayEventHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const onTheWayOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    const formatedOrder = this.orderFormaterForUser(
      'order:on-the-way',
      onTheWayOrder,
    );
    this.server
      .to(listenerUser.socketId)
      .emit('order:on-the-way', formatedOrder);
  }
  async bikerArrivedEventHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const arrivedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    const formatedOrder = this.orderFormaterForUser(
      'order:arrived',
      arrivedOrder,
    );
    this.server.to(listenerUser.socketId).emit('order:arrived', formatedOrder);
  }
  async orderOnWashingEventHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const onWashingOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    const formatedOrder = this.orderFormaterForUser(
      'order:on-washing',
      onWashingOrder,
    );
    this.server
      .to(listenerUser.socketId)
      .emit('order:on-washing', formatedOrder);
  }
  async orderCompletedEventHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const completedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    const formatedOrder = this.orderFormaterForUser(
      'order:completed',
      completedOrder,
    );
    this.server
      .to(listenerUser.socketId)
      .emit('order:completed', formatedOrder);
  }
}
