import { Module } from '@nestjs/common';
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
  ],
  providers: [OrdersRepository, UsersOrdersService, OrderStatusValidator],
  controllers: [UserOrdersController],
})
export class OrdersModule {}
