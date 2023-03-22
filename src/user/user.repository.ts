import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel, userModelName } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserRegisterDTO, UserUpdateProfileDTO } from './dto';
import { MethodNotAllowedResponse } from '../common/errors/MethodNotAllowedResponse';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(userModelName) private readonly userModel: Model<UserModel>,
    private firebaseService: FirebaseService,
  ) {}

  async create(userRegsiterDTO: UserRegisterDTO) {
    // Check Existence
    if (await this.checkPhoneExistence(userRegsiterDTO.phone))
      throw new MethodNotAllowedResponse({
        ar: 'الرقم مسجل من قبل',
        en: 'Phone is already exist',
      });

    // Check EmailExistence
    if (await this.checkEmailIsAlreadyExist(userRegsiterDTO.email))
      throw new MethodNotAllowedResponse({
        ar: 'البريد الإلكتروني مسجل من قبل',
        en: 'Email is already exist',
      });

    // Create User
    const createdUser = await this.userModel.create({
      userName: userRegsiterDTO.userName,
      email: userRegsiterDTO.email,
      phone: userRegsiterDTO.phone,
      fcmTokens: [userRegsiterDTO.fcmToken],
    });

    return createdUser;
  }

  async update(
    userId: string,
    userUpdateProfileDTO: UserUpdateProfileDTO,
    image: Express.Multer.File,
  ) {
    const userProfile = await this.findUserById(userId);

    if (
      await this.checkEmailExistenceForAnotherUser(
        userId,
        userUpdateProfileDTO.email,
      )
    )
      throw new MethodNotAllowedResponse({
        ar: 'هذا البريد الإلكتروني مسجل من قبل',
        en: 'Email is already exist',
      });

    userProfile.userName = userUpdateProfileDTO.userName;
    userProfile.email = userUpdateProfileDTO.email;
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

    return userProfile;
  }

  async delete(userId: string) {
    const userProfile = await this.findUserByIdOr404(userId);
    userProfile.isDeleted = true;
    userProfile.phone = '-d' + userProfile.phone;
    userProfile.email = '-d' + userProfile.email;
    userProfile.fcmTokens = [];
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

    return userDocument;
  }
  async findUserById(id: string) {
    const userDocument = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    return userDocument;
  }

  async findUser(userId: string) {
    return await this.userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('+fcmTokens')
      .exec();
  }

  async checkPhoneExistence(phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
        isDeleted: false,
      })
      .exec();

    return userDocument ? true : false;
  }
  async checkPhoneExistenceForAnotherUser(userId: string, phone: string) {
    const userDocument = await this.userModel
      .findOne({
        phone: phone,
        isDeleted: false,
        _id: { $ne: userId },
      })
      .exec();

    return userDocument ? true : false;
  }

  async checkEmailIsAlreadyExist(email: string) {
    const userDocument = await this.userModel
      .findOne({
        email: email,
        isDeleted: false,
      })
      .exec();

    return userDocument ? true : false;
  }

  async checkEmailExistenceForAnotherUser(userId: string, email: string) {
    const userDocument = await this.userModel
      .findOne({
        email: email,
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
      .select('+fcmTokens')
      .exec();

    if (!userDocument)
      throw new NotFoundResponse({
        ar: 'هذا الرقم غير مسجل',
        en: 'phone is not exist',
      });

    return userDocument;
  }
}
