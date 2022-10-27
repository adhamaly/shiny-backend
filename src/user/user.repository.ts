import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserRegisterDTO, UserUpdateProfileDTO } from './dto';
import { MethodNotAllowedResponse, NotFoundResponse } from 'src/common/errors';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserModel>,
    private firebaseService: FirebaseService,
  ) {}

  async create(userRegsiterDTO: UserRegisterDTO) {
    // Check existance
    if (await this.checkPhoneExistance(userRegsiterDTO.phone))
      throw new MethodNotAllowedResponse({
        ar: 'الرقم مسجل من قبل',
        en: 'Phone is already exist',
      });

    // Create User
    const createdUser = await this.userModel.create({
      userName: userRegsiterDTO.userName,
      email: userRegsiterDTO.email,
      phone: userRegsiterDTO.phone,
    });

    return createdUser.toObject();
  }

  async update(
    userId: string,
    userUpdateProfileDTO: UserUpdateProfileDTO,
    image: Express.Multer.File,
  ) {
    const userProfile = await this.findUserById(userId);

    if (
      await this.checkPhoneExistanceForAnotherUser(
        userId,
        userUpdateProfileDTO.phone,
      )
    )
      throw new MethodNotAllowedResponse({
        ar: 'هذا الرقم مسجل من قبل',
        en: 'Phone is already exist',
      });

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

  async delete(userId: string) {
    const userProfile = await this.findUserById(userId);
    userProfile.isDeleted = true;
    await userProfile.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find({ isDeleted: false }).exec();
  }
  async findUserByIdOr404(id: string) {
    const userDocument = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!userDocument)
      throw new NotFoundResponse({
        ar: 'هذا المستخدم غير مسجل',
        en: 'User Not Found',
      });

    return userDocument.toObject();
  }
  async findUserById(id: string) {
    const userDocument = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    return userDocument;
  }

  async checkPhoneExistance(phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
        isDeleted: false,
      })
      .exec();

    return userDocument ? true : false;
  }
  async checkPhoneExistanceForAnotherUser(userId: string, phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
        isDeleted: false,
        _id: { $ne: userId },
      })
      .exec();

    return userDocument ? true : false;
  }

  async findUserByPhoneOr404(phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
        isDeleted: false,
      })
      .exec();

    if (!userDocument)
      throw new NotFoundResponse({
        ar: 'هذا الرقم غير مسجل',
        en: 'phone is not exist',
      });

    return userDocument.toObject();
  }
}
