import { Controller } from '@nestjs/common';
import { UsersOrdersService } from '../services/userOrders.service';

@Controller('orders/user')
export class UserOrdersController {
  constructor(private usersOrdersService: UsersOrdersService) {}
}
