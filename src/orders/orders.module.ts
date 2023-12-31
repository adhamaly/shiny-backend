import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ordersModelName, OrdersSchema } from './schemas/orders.schema';
import { UserModule } from '../user/user.module';
import { LocationsModule } from '../locations/locations.module';
import { WashingServicesModule } from '../washing-services/washing-services.module';
import { OrdersRepository } from './repositories/orders.repository';
import { UsersOrdersService } from './services/userOrders.service';
import { UserOrdersController } from './controllers/userOrders.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PlansModule } from '../plans/plans.module';
import { OrderStatusValidator } from './validators/orderStatusValidator';
import { PromoCodeModule } from '../promo-code/promo-code.module';
import { PaginationModule } from '../common/services/pagination/pagination.module';
import { OrderGateway } from './gateway/order.gateway';
import { AuthModule } from '../auth/auth.module';
import { BikersModule } from '../bikers/bikers.module';
import { BikerOrdersService } from './services/bikerOrders.service';
import { BikerOrdersController } from './controllers/bikerOrders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminModule } from 'src/admin/admin.module';
import { AdminsOrdersController } from './controllers/adminOrders.controller';
import { AdminsOrdersService } from './services/adminOrders.service';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ordersModelName, schema: OrdersSchema },
    ]),
    UserModule,
    LocationsModule,
    WashingServicesModule,
    SubscriptionsModule,
    PlansModule,
    PromoCodeModule,
    PaginationModule,
    forwardRef(() => AuthModule),
    forwardRef(() => BikersModule),
    NotificationsModule,
    AdminModule,
    PointsModule,
  ],
  providers: [
    OrdersRepository,
    UsersOrdersService,
    OrderStatusValidator,
    OrderGateway,
    BikerOrdersService,
    AdminsOrdersService,
  ],
  controllers: [
    UserOrdersController,
    BikerOrdersController,
    AdminsOrdersController,
  ],
  exports: [UsersOrdersService],
})
export class OrdersModule {}
