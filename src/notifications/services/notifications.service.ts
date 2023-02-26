import { Injectable } from '@nestjs/common';
import { FCMService } from '../../common/services/firebase/fcm.service';
import {
  NotificationsMessages,
  Notification,
} from './notifications-message.service';
import { InjectModel } from '@nestjs/mongoose';
import {
  notificationsModelName,
  NotificationsModel,
} from '../schemas/notifications.schema';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../../user/user.service';
import { NotifcationsPaginationsDTO } from '../dtos/notificationsPaginations.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';
import { NotificationsType } from 'src/common/enums/topics.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(notificationsModelName)
    private readonly notificationsModel: Model<NotificationsModel>,
    private fcmService: FCMService,
    private userService: UserService,
    private paginationService: PaginationService,
  ) {}

  async sendNewPromoCodeCreatedNotification(
    promoCode: string,
    discountPercentage: number,
  ) {
    console.log(promoCode);

    const newPromoCodeMsg = NotificationsMessages.newPromoCodePublished(
      promoCode,
      discountPercentage,
    );
    console.log('Here ...');

    // await this.fcmService.pushNotificationToTopics({
    //   notification: newPromoCodeMsg['en'],
    //   topic: FcmTopics.PROMO_CODE_CREATED,
    // });

    await this.saveTopicBasedNotification(
      NotificationsType.PROMO_CODE_BASED,
      newPromoCodeMsg,
    );
  }
  async sendOrderAcceptedByBikerNotificaiton(
    userId: string,
    userLang: string,
    userFcmTokens: string[],
    bikerName: string,
    orderId: string,
  ) {
    const orderAcceptedByBikerMessage =
      NotificationsMessages.orderAcceptedByBikerMessage(
        bikerName,
        orderId,
        userId,
      );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: orderAcceptedByBikerMessage[userLang || 'en'],
      data: orderAcceptedByBikerMessage.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(userId, orderAcceptedByBikerMessage);

    await this.checkFcmResponse(fcmResponse, userId, userFcmTokens, 'user');
  }

  async sendBikerOnTheWayNotificaiton(
    userId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
  ) {
    const bikerOnTheWayMessage = NotificationsMessages.bikerOntheWayMessage(
      orderId,
      userId,
    );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: bikerOnTheWayMessage[userLang || 'en'],
      data: bikerOnTheWayMessage.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(userId, bikerOnTheWayMessage);

    await this.checkFcmResponse(fcmResponse, userId, userFcmTokens, 'user');
  }

  async sendBikerArrivedNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
  ) {
    const bikerArrivedMessage = NotificationsMessages.bikerArrivedMessage(
      orderId,
      receiverId,
    );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: bikerArrivedMessage[userLang || 'en'],
      data: bikerArrivedMessage.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(receiverId, bikerArrivedMessage);

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendOrderCompletedNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
  ) {
    const orderCompletedMsg = NotificationsMessages.orderCompletedMessage(
      orderId,
      receiverId,
    );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: orderCompletedMsg[userLang || 'en'],
      data: orderCompletedMsg.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(receiverId, orderCompletedMsg);

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendOrderUnderReviewNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
  ) {
    const orderUnderReviewMsg = NotificationsMessages.orderUnderReviewMessage(
      orderId,
      receiverId,
    );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: orderUnderReviewMsg[userLang || 'en'],
      data: orderUnderReviewMsg.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(receiverId, orderUnderReviewMsg);

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendAdminAssignedOrderToBikerNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
    adminUserName: string,
  ) {
    const assignOrderToBikerByAdminMsg =
      NotificationsMessages.assignOrderToBikerByAdminMessage(
        orderId,
        receiverId,
        adminUserName,
      );

    const fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
      notification: assignOrderToBikerByAdminMsg[userLang || 'en'],
      data: assignOrderToBikerByAdminMsg.data,
      tokens: userFcmTokens,
    });
    await this.saveNotification(receiverId, assignOrderToBikerByAdminMsg);

    await this.checkFcmResponse(
      fcmResponse,
      receiverId,
      userFcmTokens,
      'biker',
    );
  }

  async sendPendingOrderToAdminNotification(
    adminsIds: string[],
    orderId: string,
  ) {
    const orderPendingAdminAssignMsg =
      NotificationsMessages.orderPendingAdminAssign(orderId);

    adminsIds.forEach(async (adminId) => {
      await this.saveNotification(adminId, orderPendingAdminAssignMsg);
    });
  }

  async saveNotification(receiverId: string, message: Notification) {
    await this.notificationsModel.create({
      receiver: new mongoose.Types.ObjectId(receiverId),
      receiverModel: message.data.receiverModel,
      clickableItem: new mongoose.Types.ObjectId(message.data.clickableItem),
      clickableItemModel: message.data.clickItemModel,
      'message.arTitle': message.ar.title,
      'message.arBody': message.ar.body,
      'message.enTitle': message.en.title,
      'message.enBody': message.en.body,
      type: NotificationsType.TOKEN_BASED,
    });
  }

  async saveTopicBasedNotification(type: string, message: Notification) {
    await this.notificationsModel.create({
      'message.arTitle': message.ar.title,
      'message.arBody': message.ar.body,
      'message.enTitle': message.en.title,
      'message.enBody': message.en.body,
      type: type,
    });
  }
  async setNotificationIsRead(notificationId: string) {
    await this.notificationsModel
      .findByIdAndUpdate(notificationId, {
        $set: { isRead: true },
      })
      .exec();
  }

  async getAllNotificationsForReceiver(
    receiverId: string,
    role: string,
    notifcationsPaginationsDTO: NotifcationsPaginationsDTO,
  ) {
    const { skip, limit } = this.paginationService.getSkipAndLimit(
      Number(notifcationsPaginationsDTO.page),
      Number(notifcationsPaginationsDTO.perPage),
    );

    let userCreatedDate: Date;
    if (role === 'user')
      userCreatedDate = (await this.userService.getUserById(receiverId))
        .createdAt;

    const notifications = await this.notificationsModel
      .find({
        ...(role === 'user'
          ? {
              $or: [
                {
                  $and: [
                    { createdAt: { $gte: userCreatedDate.toISOString() } },
                    { type: NotificationsType.PROMO_CODE_BASED },
                  ],
                },
                {
                  receiver: receiverId,
                },
              ],
            }
          : { receiver: receiverId }),
      })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .exec();

    const count = await this.notificationsModel
      .countDocuments({
        ...(role === 'user'
          ? {
              $or: [
                {
                  $and: [
                    { createdAt: { $gte: userCreatedDate.toISOString() } },
                    { type: NotificationsType.PROMO_CODE_BASED },
                  ],
                },
                {
                  receiver: receiverId,
                },
              ],
            }
          : { receiver: receiverId }),
      })
      .exec();

    return this.paginationService.paginate(
      notifications,
      count,
      Number(notifcationsPaginationsDTO.page),
      Number(notifcationsPaginationsDTO.perPage),
    );
  }
  //TODO: Remove invalid fcmTokens for bikers
  async checkFcmResponse(
    response: any,
    receiverId: string,
    tokens: string[],
    role: string,
  ) {
    // if response includes token error
    if (response?.failureCount > 0) {
      console.log(response);
      console.log(tokens);

      // iterate and get the invalid one then remove it
      for (let i = 0; i < response.responses.length; i++) {
        if (!response.responses[i].success) {
          if (
            response.responses[i].error.code ===
              'messaging/registration-token-not-registered' ||
            response.responses[i].error.code === 'messaging/invalid-argument' ||
            response.responses[i].error.code ===
              'messaging/invalid-registration-token'
          ) {
            console.log(response.responses[i]);
            console.log(tokens[i] + ' is invalid then remove it');
            await this.userService.removeInvalidFcmToken(receiverId, tokens[i]);
          }
        }
      }
    }
  }
}
