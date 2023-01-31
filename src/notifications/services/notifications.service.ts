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
import { Model } from 'mongoose';
import { UserService } from '../../user/user.service';
import { NotifcationsPaginationsDTO } from '../dtos/notificationsPaginations.dto';
import { PaginationService } from '../../common/services/pagination/pagination.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(notificationsModelName)
    private readonly notificationsModel: Model<NotificationsModel>,
    private fcmService: FCMService,
    private userService: UserService,
    private paginationService: PaginationService,
  ) {}

  async sendOrderAcceptedByBikerNotificaiton(
    userId: string,
    userLang: string,
    userFcmTokens: string[],
    bikerName: string,
    orderId: string,
  ) {
    // TODO:

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

    await this.checkFcmResponse(fcmResponse, userId, userFcmTokens);
  }

  async saveNotification(receiverId: string, message: Notification) {
    // TODO:
    await this.notificationsModel.create({
      receiver: receiverId,
      clickableItem: message.data.clickableItem,
      clickableItemModel: message.data.clickItemModel,
      'message.arTitle': message.ar.title,
      'message.arBody': message.ar.body,
      'message.enTitle': message.en.title,
      'message.enBody': message.en.body,
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
    notifcationsPaginationsDTO: NotifcationsPaginationsDTO,
  ) {
    const { skip, limit } = this.paginationService.getSkipAndLimit(
      Number(notifcationsPaginationsDTO.page),
      Number(notifcationsPaginationsDTO.perPage),
    );

    const notifications = await this.notificationsModel
      .find({
        receiver: receiverId,
      })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .exec();

    const count = await this.notificationsModel
      .count({
        receiver: receiverId,
      })
      .exec();

    return this.paginationService.paginate(
      notifications,
      count,
      Number(notifcationsPaginationsDTO.page),
      Number(notifcationsPaginationsDTO.perPage),
    );
  }
  async checkFcmResponse(response: any, receiverId: string, tokens: string[]) {
    // if response includes token error
    if (response.failureCount > 0) {
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
