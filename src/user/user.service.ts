import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { UserRegisterDTO } from './dto/user.register.dto';
import { MethodNotAllowedResponse, NotFoundResponse } from 'src/common/errors';
import { Injectable } from '@nestjs/common';
import { UserUpdateProfileDTO } from './dto/user.updateProfile.dto';
import FirebaseService from '../common/services/firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private firebaseService: FirebaseService,
  ) {}

  async create(userRegsiterDTO: UserRegisterDTO) {
    // Check existance
    if (await this.isPhoneExist(userRegsiterDTO.phone))
      throw new MethodNotAllowedResponse({
        ar: 'الرقم مسجل من قبل',
        en: 'phone is already exist',
      });

    // Create User
    const createdUser = await this.userModel.create({
      userName: userRegsiterDTO.userName,
      email: userRegsiterDTO.email,
      phone: userRegsiterDTO.phone,
    });

    // TODO: Add FcmTokens service
    return createdUser.toObject();
  }

  async update(
    userId: string,
    userUpdateProfileDTO: UserUpdateProfileDTO,
    image: Express.Multer.File,
  ) {
    const userProfile = await this.getUserById(userId);

    userProfile.userName = userUpdateProfileDTO.userName;
    userProfile.email = userUpdateProfileDTO.email;
    userProfile.phone = userUpdateProfileDTO.phone;
    userProfile.gender = userUpdateProfileDTO.gender;
    await userProfile.save();

    if (image) {
      if (userProfile.imagePath)
        await this.firebaseService.deleteFileFromStorage(userProfile.imagePath);

      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      userProfile.imageLink = fileLink;
      userProfile.imagePath = filePath;
      await userProfile.save();
    }

    return userProfile.toObject();
  }

  async getAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async isPhoneExist(phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
      })
      .exec();

    return userDocument ? true : false;
  }

  async getUserByPhoneOr404(phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
      })
      .exec();

    if (!userDocument)
      throw new NotFoundResponse({
        ar: 'هذا الرقم غير مسجل',
        en: 'phone is not exist',
      });

    return userDocument.toObject();
  }
  async getUserByIdOr404(id: string) {
    const userDocument = await this.userModel.findById(id).exec();

    if (!userDocument)
      throw new NotFoundResponse({
        ar: 'هذا المستخدم غير مسجل',
        en: 'User Not Found',
      });

    return userDocument.toObject();
  }
  async getUserById(id: string) {
    const userDocument = await this.userModel.findById(id).exec();
    return userDocument;
  }
}
