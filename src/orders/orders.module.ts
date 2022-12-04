import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ordersModelName, OrdersSchema } from './schemas/orders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ordersModelName, schema: OrdersSchema },
    ]),
  ],
})
export class OrdersModule {}
