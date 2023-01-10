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
import { BikersService } from '../../bikers/bikers.service';
import { LocationsService } from '../../locations/services/locations.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/schemas/user.schema';

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
    const user = await this.authService.getUserByIdAndRole(
      userPayload.id,
      userPayload.role,
    );
    if (!user) {
      return this.disconnect(socket);
    }
    // Inject user into socket
    socket.data.user = user;
    // Update SocketId
    await this.authService.updateUserSocketId(
      userPayload.id,
      userPayload.role,
      socket.id,
    );
  }
  private disconnect(socket: Socket) {
    socket.emit('Error', new UnAuthorizedResponse({ ar: '', en: '' }));
    socket.disconnect();
  }

  async emitOrderToAllOnlineBikers(order: string) {
    const publishedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    // Get All Online Bikers
    const onlineBikers =
      await this.bikersService.getAllOnlineBikersForOrderLocation(
        publishedOrder.location.city,
      );
    // Send Order to All of them
    for (const biker of onlineBikers) {
      this.server.to(biker.socketId).emit('order:published', publishedOrder);
    }
  }

  async orderAcceptedByBikerHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const acceptedOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    this.server.to(listenerUser.socketId).emit('order:accepted', acceptedOrder);
  }
  async orderOnTheWayByBikerHandler(order: string, userId: any) {
    const listenerUser = await this.userService.getUser(userId);
    const onTheWayOrder = await this.usersOrdersService.getOrderByIdPopulated(
      order,
    );
    this.server
      .to(listenerUser.socketId)
      .emit('order:on-the-way', onTheWayOrder);
  }
}
