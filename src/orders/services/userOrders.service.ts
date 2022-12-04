import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class UsersOrdersService {
  constructor(private OrdersRepository: OrdersRepository) {}
}
