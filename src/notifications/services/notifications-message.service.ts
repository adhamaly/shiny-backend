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
    clickableItem?: string;
    clickItemModel?: string;
    receiverId?: string;
    receiverModel?: string;
    role?: string;
  };
};
@Injectable()
export class NotificationsMessages {
  constructor() {
    /* TODO document why this constructor is empty */
  }

  static newPromoCodePublished(
    code: string,
    discountPercentage: number,
  ): Notification {
    return {
      ar: {
        title: `هناك برومو كود`,
        body: `هناك برومو كود`,
      },
      en: {
        title: 'A small gift awaits you',
        body: `Use ${code} to get a ${discountPercentage}% `,
      },
      data: {
        role: 'user',
      },
    };
  }

  static orderAssignedByAdminMessage(
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
        title: 'Your request has been confirmed',
        body: `${bikerName} accepts your request`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
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
        title: 'Your request has been confirmed',
        body: `${bikerName} accepts your request`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
  }

  static bikerOntheWayMessage(
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'Be ready',
        body: `The biker on his way`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
  }
  static bikerArrivedMessage(
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'The biker arrived',
        body: `Our hero is excited about washing  your car`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
  }

  static orderCompletedMessage(
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'The washing has been completed',
        body: `Your car is ready to use and you got`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
  }

  static orderUnderReviewMessage(
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'Searching for the biker',
        body: `Your order will be confirmed within 10 minutes`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'user',
        role: 'user',
      },
    };
  }

  static assignOrderToBikerByAdminMessage(
    orderId: string,
    receiverId: string,
  ): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'Assigned order',
        body: `The Admin Assigned you to order, click here to know more details`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverId: receiverId.toString(),
        receiverModel: 'biker',
        role: 'biker',
      },
    };
  }

  static orderPendingAdminAssign(orderId: string): Notification {
    return {
      ar: {
        title: `هناك طلب`,
        body: `هناك طلب`,
      },
      en: {
        title: 'Pending request',
        body: `The request ${orderId.toString()} is pending for more than 5 minutes`,
      },
      data: {
        clickableItem: orderId.toString(),
        clickItemModel: ordersModelName,
        receiverModel: 'admin',
        role: 'admins',
      },
    };
  }
}
