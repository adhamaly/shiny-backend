import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRegisterDTO } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllController() {
    return { data: await this.userService.getAll() };
  }
}
