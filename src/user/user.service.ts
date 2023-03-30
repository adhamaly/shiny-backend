import { UserRegisterDTO } from './dto/user.register.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserUpdateProfileDTO } from './dto/user.updateProfile.dto';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';
import { UpdatePhoneNumberDTO } from './dto/user.updatePhoneNumber.dto';
import { UpdateUserLocation } from './dto';
import { UserQueriesHelper } from './userQueriesHelper.service';
import { City } from '../city/schemas/city.schema';
import { Types } from 'mongoose';
import { NearestCityCalculator } from '../city/nearestCityCalculator.service';
import { SubscriptionsService } from '../subscriptions/services/subscriptions.service';
import { FCMService } from 'src/common/services/firebase/fcm.service';
import { FcmTopics } from 'src/common/enums/topics.enum';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userQueriesHelper: UserQueriesHelper,
    private nearestCityCalculator: NearestCityCalculator,
    @Inject(forwardRef(() => SubscriptionsService))
    private subscriptionsService: SubscriptionsService,
    private fcmService: FCMService,
  ) {}

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

  async updatePhoneNumber(
    id: string,
    updatePhoneNumberDTO: UpdatePhoneNumberDTO,
  ) {
    const userDocument = await this.userRepository.findUserByIdOr404(id);

    userDocument.phone = updatePhoneNumberDTO.phone;
    await userDocument.save();

    return userDocument;
  }

  async updateUserLocation(id: string, updateUserLocation: UpdateUserLocation) {
    // TODO: Get the nearest city:- Calculate Nearest city for this lat and long
    // TODO: Add TO USER Language prop for handling responses Messages

    const user = await this.userRepository.findUserById(id);

    if (
      !this.nearestCityCalculator.isCountryBoundariesValid(
        updateUserLocation.country,
      )
    )
      return user.language === 'en'
        ? 'Our Service Not Exist Waiting for us soon..'
        : 'خدماتنا غير متوفرة حاليا';

    const nearestCity = await this.nearestCityCalculator.findNearestCity(
      Number(updateUserLocation.latitude),
      Number(updateUserLocation.longitude),
    );

    if (!this.nearestCityCalculator.isCityExistenceValid(nearestCity['city']))
      return user.language === 'en'
        ? 'Our Service Not Exist Waiting for us soon..'
        : 'خدماتنا غير متوفرة حاليا';

    // Update User Location
    await this.userQueriesHelper.updateUserLocation(
      id,
      updateUserLocation,
      nearestCity['city']._id,
    );

    return user.language === 'en' ? 'done' : 'تم التعديل بنجاح';
  }

  async updateUserLanguage(id: string, language: string) {
    const userDocument = await this.userRepository.findUserByIdOr404(id);

    userDocument.language = language;
    await userDocument.save();
  }

  async delete(userId: string) {
    await this.userRepository.delete(userId);
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async isPhoneExist(phone: string) {
    return await this.userRepository.checkPhoneExistence(phone);
  }

  async getUserByPhoneOr404(phone: string) {
    const userDocument = await this.userRepository.findUserByPhoneOr404(phone);
    return userDocument;
  }
  async getUserByIdOr404(id: string) {
    const subscription = await this.subscriptionsService.getUserSubscription(
      id,
    );
    const user = await this.userRepository.findUserByIdOr404(id);

    return {
      ...user.toObject(),
      isSubscribed: subscription ? true : false,
    };
  }
  async getUserById(id: string) {
    return await this.userRepository.findUserById(id);
  }
  async getUser(userId: string) {
    return await this.userRepository.findUser(userId);
  }
  async updateUserSocketId(id: string, socketId: string) {
    const user = await this.userRepository.findUserByIdOr404(id);

    user.socketId = socketId;
    await user.save();
  }
  checkWalletBalanceValid(user: User, orderTotalPrice: number) {
    return user.walletBalance >= orderTotalPrice ? true : false;
  }
  async payWithWallet(userId: string, amount: number) {
    const userDocument = await this.userRepository.findUserByIdOr404(userId);
    userDocument.walletBalance = userDocument.walletBalance - amount;
    await userDocument.save();
  }

  async pointsEarningUpdate(userId: string, points: number) {
    const user = await this.userRepository.findUserById(userId);
    user.points = user.points + points;
    await user.save();
  }
  async removeInvalidFcmToken(userId: string, fcmToken: string) {
    const user = await this.userRepository.findUser(userId);
    const updatedUserFcmTokens = user.fcmTokens.filter((fcmTokenItem) => {
      return fcmTokenItem !== fcmToken;
    });
    console.log('valid fcmTokens :' + updatedUserFcmTokens);

    user.fcmTokens = updatedUserFcmTokens;
    await user.save();
  }

  async updateUserNotificationPermission(userId: string, allow: string) {
    const user = await this.userRepository.findUser(userId);

    user.isAllowNotification = allow === 'on' ? true : false;

    if (allow !== 'on') {
      if (user.fcmTokens.length) {
        await this.fcmService.unSubscribeToTopic(
          user.fcmTokens,
          FcmTopics.PROMO_CODE_CREATED,
        );
      }
    }
    await user.save();
  }
}
