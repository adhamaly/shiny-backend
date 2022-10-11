import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from './schemas/user.schema';
import { UserRegisterDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserModel>) {}

  async create(userRegsiterDTO: UserRegisterDTO) {
    return await this.userModel.create({
      username: userRegsiterDTO.userName,
      email: userRegsiterDTO.email,
      phoneNumber: userRegsiterDTO.phoneNumber,
    });
  }

  async getAll() {
    return await this.userModel.find();
  }
}
