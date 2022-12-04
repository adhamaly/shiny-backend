import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ordersModelName, OrdersModel } from '../schemas/orders.schema';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(ordersModelName)
    private readonly ordersModel: Model<OrdersModel>,
  ) {}
}
