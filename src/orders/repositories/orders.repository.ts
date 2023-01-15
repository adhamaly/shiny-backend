import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ordersModelName,
  OrdersModel,
  OrderStatus,
} from '../schemas/orders.schema';
import { User, userModelName } from '../../user/schemas/user.schema';
import { OrderCreationDTO } from '../dtos/OrderCreation.dto';
import {
  Location,
  locationModelName,
} from '../../locations/schemas/location.schema';
import { WashingServicesModelName } from '../../washing-services/schemas/washing-services.schema';
import { addOnsModelName } from '../../add-ons/schemas/add-ons.schema';
import { vehicleModelName } from '../../vehicles/schemas/vehicles.schema';
import { Order } from '../schemas/orders.schema';
import { promoCodeModelName } from '../../promo-code/schemas/promo-code.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import { bikerModelName } from '../../bikers/schemas/bikers.schema';

@Injectable()
export class OrdersRepository {
  populatedPaths = [
    {
      path: 'washingServices',
      populate: {
        path: 'icon',
        select: 'iconPath iconLink',
        model: servicesIconModelName,
      },
      model: WashingServicesModelName,
      select: 'name price description duration pointsToPay',
    },
    {
      path: 'addOns',
      populate: {
        path: 'icon',
        select: 'iconPath iconLink',
        model: servicesIconModelName,
      },
      model: addOnsModelName,
      select: 'name price',
    },
    {
      path: 'vehicle',
      model: vehicleModelName,
      select: 'type brand model plateNumber color imageLink imagePath',
    },
    {
      path: 'location',
      model: locationModelName,
      select:
        'latitude longitude streetName subAdministrativeArea isSaved savedName city',
    },
    {
      path: 'promoCode',
      model: promoCodeModelName,
      select: 'code',
    },
    {
      path: 'user',
      model: userModelName,
      select: 'userName imageLink',
    },
    {
      path: 'biker',
      model: bikerModelName,
      select: 'userName phone imageLink imagePath',
    },
  ];

  constructor(
    @InjectModel(ordersModelName)
    private readonly ordersModel: Model<OrdersModel>,
  ) {}

  async create(
    user: User,
    orderCreationDTO: OrderCreationDTO,
    location: Location,
    totalDuration: number,
    orderStatus: OrderStatus,
  ) {
    const createdOrder = await this.ordersModel.create({
      user: user,
      washingServices: orderCreationDTO.washingServices,
      addOns: orderCreationDTO.addOns,
      vehicle: orderCreationDTO.vehicle,
      location: location,
      startTime: orderCreationDTO.startTime,
      totalDuration: totalDuration,
      description: orderCreationDTO.description,
      type: orderCreationDTO.type,
      totalPrice: orderCreationDTO.totalPrice,
      totalPay: orderCreationDTO.totalPrice,
      subscription: orderCreationDTO.subscription,
      status: orderStatus,
      paymentType: orderCreationDTO.paymentType,
    });

    return createdOrder;
  }

  async findAllUserOrders(
    user: User,
    status: string,
    skip: number,
    limit: number,
  ) {
    const orders = await this.ordersModel
      .find({
        user: user,
        ...(status === OrderStatus.ACTIVE
          ? {
              status: {
                $in: [
                  OrderStatus.ACTIVE,
                  OrderStatus.ACCEPTED_BY_BIKER,
                  OrderStatus.WAITING_FOR_BIKER,
                  OrderStatus.BIKER_ON_THE_WAY,
                  OrderStatus.BIKER_ARRIVED,
                  OrderStatus.ON_WASHING,
                ],
              },
            }
          : {
              status: {
                $in: [
                  OrderStatus.PENDING_USER_PAYMENT,
                  OrderStatus.PENDING_USER_REVIEW,
                  OrderStatus.CANCELLED_BY_BIKER,
                  OrderStatus.CANCELLED_BY_USER,
                  OrderStatus.COMPLETED,
                ],
              },
            }),
      })
      .skip(skip)
      .limit(limit)
      .populate(this.populatedPaths)
      .exec();

    const count = await this.ordersModel
      .count({
        user: user,
        ...(status === OrderStatus.ACTIVE
          ? {
              status: {
                $in: [
                  OrderStatus.ACTIVE,
                  OrderStatus.ACCEPTED_BY_BIKER,
                  OrderStatus.WAITING_FOR_BIKER,
                  OrderStatus.BIKER_ON_THE_WAY,
                  OrderStatus.BIKER_ARRIVED,
                  OrderStatus.ON_WASHING,
                ],
              },
            }
          : {
              status: {
                $in: [
                  OrderStatus.PENDING_USER_PAYMENT,
                  OrderStatus.PENDING_USER_REVIEW,
                  OrderStatus.CANCELLED_BY_BIKER,
                  OrderStatus.CANCELLED_BY_USER,
                  OrderStatus.COMPLETED,
                ],
              },
            }),
      })
      .exec();

    return { orders, count };
  }

  async findOrderByIdOr404(id: string) {
    const order = await this.ordersModel.findById(id).exec();
    if (!order)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا الطلب',
        en: 'Order Not Found',
      });

    return order;
  }
  async findOrderByIdPopulatedOr404(id: string) {
    const order = await this.ordersModel
      .findById(id)
      .populate(this.populatedPaths)
      .exec();
    if (!order)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا الطلب',
        en: 'Order Not Found',
      });

    return order;
  }
  async findOrder(order: Order) {
    return await this.ordersModel.findOne({ _id: order }).exec();
  }
  async update(id: string, updatedKeys: any) {
    return await this.ordersModel
      .findByIdAndUpdate(
        id,
        {
          $set: { ...updatedKeys },
        },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findOneQuery(QueryObject: any) {
    return await this.ordersModel.findOne(QueryObject).exec();
  }

  async findManyQuery(QueryObject: any) {
    return await this.ordersModel.find(QueryObject).exec();
  }

  async findManyQueryPopulated(QueryObject: any) {
    return await this.ordersModel
      .find(QueryObject)
      .populate(this.populatedPaths)
      .exec();
  }
}
