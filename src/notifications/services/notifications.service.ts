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
import { FcmTopics, NotificationsType } from 'src/common/enums/topics.enum';

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
    const newPromoCodeMsg = NotificationsMessages.newPromoCodePublished(
      promoCode,
      discountPercentage,
    );

    await this.fcmService.pushNotificationToTopics({
      notification: newPromoCodeMsg['en'],
      topic: FcmTopics.PROMO_CODE_CREATED,
    });

    await this.saveTopicBasedNotification(
      NotificationsType.NEW_PROMO_CODE,
      newPromoCodeMsg,
    );
  }
  async sendOrderAcceptedByBikerNotificaiton(
    userId: string,
    userLang: string,
    userFcmTokens: string[],
    bikerName: string,
    orderId: string,
    userAllowNotification: boolean,
  ) {
    const orderAcceptedByBikerMessage =
      NotificationsMessages.orderAcceptedByBikerMessage(
        bikerName,
        orderId,
        userId,
      );

    let fcmResponse: any;
    if (userAllowNotification) {
      fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
        notification: orderAcceptedByBikerMessage[userLang || 'en'],
        data: orderAcceptedByBikerMessage.data,
        tokens: userFcmTokens,
      });
    }

    await this.saveNotification(
      userId,
      orderAcceptedByBikerMessage,
      NotificationsType.ORDER_TRACKING,
    );

    await this.checkFcmResponse(fcmResponse, userId, userFcmTokens, 'user');
  }

  async sendBikerOnTheWayNotificaiton(
    userId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
    userAllowNotification: boolean,
  ) {
    const bikerOnTheWayMessage = NotificationsMessages.bikerOntheWayMessage(
      orderId,
      userId,
    );

    let fcmResponse: any;
    if (userAllowNotification) {
      fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
        notification: bikerOnTheWayMessage[userLang || 'en'],
        data: bikerOnTheWayMessage.data,
        tokens: userFcmTokens,
      });
    }
    await this.saveNotification(
      userId,
      bikerOnTheWayMessage,
      NotificationsType.ORDER_TRACKING,
    );

    await this.checkFcmResponse(fcmResponse, userId, userFcmTokens, 'user');
  }

  async sendBikerArrivedNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
    userAllowNotification: boolean,
  ) {
    const bikerArrivedMessage = NotificationsMessages.bikerArrivedMessage(
      orderId,
      receiverId,
    );

    let fcmResponse: any;
    if (userAllowNotification)
      fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
        notification: bikerArrivedMessage[userLang || 'en'],
        data: bikerArrivedMessage.data,
        tokens: userFcmTokens,
      });

    await this.saveNotification(
      receiverId,
      bikerArrivedMessage,
      NotificationsType.ORDER_TRACKING,
    );

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendOrderCompletedNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
    userAllowNotification: boolean,
  ) {
    const orderCompletedMsg = NotificationsMessages.orderCompletedMessage(
      orderId,
      receiverId,
    );

    let fcmResponse: any;
    if (userAllowNotification)
      fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
        notification: orderCompletedMsg[userLang || 'en'],
        data: orderCompletedMsg.data,
        tokens: userFcmTokens,
      });

    await this.saveNotification(
      receiverId,
      orderCompletedMsg,
      NotificationsType.ORDER_COMPLETED,
    );

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendOrderUnderReviewNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
    userAllowNotification: boolean,
  ) {
    const orderUnderReviewMsg = NotificationsMessages.orderUnderReviewMessage(
      orderId,
      receiverId,
    );

    let fcmResponse: any;
    if (userAllowNotification)
      fcmResponse = await this.fcmService.pushNotificationToDeviceGroup({
        notification: orderUnderReviewMsg[userLang || 'en'],
        data: orderUnderReviewMsg.data,
        tokens: userFcmTokens,
      });

    await this.saveNotification(
      receiverId,
      orderUnderReviewMsg,
      NotificationsType.ORDER_WAITING_FOR_ADMIN,
    );

    await this.checkFcmResponse(fcmResponse, receiverId, userFcmTokens, 'user');
  }

  async sendAdminAssignedOrderToBikerNotification(
    receiverId: string,
    userLang: string,
    userFcmTokens: string[],
    orderId: string,
  ) {
    const assignOrderToBikerByAdminMsg =
      NotificationsMessages.assignOrderToBikerByAdminMessage(
        orderId,
        receiverId,
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

  async saveNotification(
    receiverId: string,
    message: Notification,
    type?: NotificationsType,
  ) {
    await this.notificationsModel.create({
      receiver: new mongoose.Types.ObjectId(receiverId),
      receiverModel: message.data.receiverModel,
      clickableItem: new mongoose.Types.ObjectId(message.data.clickableItem),
      clickableItemModel: message.data.clickItemModel,
      'message.arTitle': message.ar.title,
      'message.arBody': message.ar.body,
      'message.enTitle': message.en.title,
      'message.enBody': message.en.body,
      type: type,
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
                    { type: NotificationsType.NEW_PROMO_CODE },
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
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.notificationsModel
      .countDocuments({
        ...(role === 'user'
          ? {
              $or: [
                {
                  $and: [
                    { createdAt: { $gte: userCreatedDate.toISOString() } },
                    { type: NotificationsType.NEW_PROMO_CODE },
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

    const totalUnRead = await this.notificationsModel.countDocuments({
      ...(role === 'user'
        ? {
            $or: [
              {
                $and: [
                  { createdAt: { $gte: userCreatedDate.toISOString() } },
                  { type: NotificationsType.NEW_PROMO_CODE },
                ],
              },
              {
                receiver: receiverId,
              },
            ],
          }
        : { receiver: receiverId }),
      isRead: false,
    });

    const paginationResult = this.paginationService.paginate(
      notifications,
      count,
      Number(notifcationsPaginationsDTO.page),
      Number(notifcationsPaginationsDTO.perPage),
    );

    return {
      paginationResult,
      totalUnRead,
    };
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
