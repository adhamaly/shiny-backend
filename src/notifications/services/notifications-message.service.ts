import { Injectable } from '@nestjs/common';
import { ordersModelName } from '../../orders/schemas/orders.schema';
export type Notification = {
  ar: {
    title: string;
    body: string;
  };
  en: {
    title: string;
    body: string;
  };
  data: {
    clickableItem: string;
    clickItemModel: string;
    receiverId: string;
    role: string;
  };
};
@Injectable()
export class NotificationsMessages {
  constructor() {
    /* TODO document why this constructor is empty */
  }

  static orderAcceptedByBikerMessage(
    bikerName: string,
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب ${bikerName}`,
        body: `راجع الطلب`,
      },
      en: {
        title: 'There is a request',
        body: `Check request`,
      },
      data: {
        clickableItem: orderId,
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        role: 'user',
      },
    };
  }
}
