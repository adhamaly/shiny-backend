import { UserRegisterDTO } from './dto/user.register.dto';
import { Injectable } from '@nestjs/common';
import { UserUpdateProfileDTO } from './dto/user.updateProfile.dto';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(userRegsiterDTO: UserRegisterDTO) {
    // Create User
    const createdUser = await this.userRepository.create(userRegsiterDTO);

    // TODO: Add FcmTokens service
    return createdUser;
  }

  async update(
    userId: string,
    userUpdateProfileDTO: UserUpdateProfileDTO,
    image: Express.Multer.File,
  ) {
    const updatedProfile = await this.userRepository.update(
      userId,
      userUpdateProfileDTO,
      image,
    );

    return updatedProfile;
  }

  async delete(userId: string) {
    await this.userRepository.delete(userId);
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async isPhoneExist(phone: string) {
    return await this.userRepository.checkPhoneExistance(phone);
  }

  async getUserByPhoneOr404(phone: string) {
    const userDocument = await this.userRepository.findUserByPhoneOr404(phone);

    return userDocument;
  }
  async getUserByIdOr404(id: string) {
    return await this.userRepository.findUserByIdOr404(id);
  }
  async getUserById(id: string) {
    return await this.userRepository.findUserById(id);
  }
}
