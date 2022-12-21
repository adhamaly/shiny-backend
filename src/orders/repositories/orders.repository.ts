import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ordersModelName,
  OrdersModel,
  OrderStatus,
} from '../schemas/orders.schema';
import { User } from '../../user/schemas/user.schema';
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

@Injectable()
export class OrdersRepository {
  populatedPaths = [
    {
      path: 'washingServices',
      model: WashingServicesModelName,
      select: 'name price',
    },
    {
      path: 'addOns',
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
        'latitude longitude streetName subAdministrativeArea isSaved savedName',
    },
    {
      path: 'promoCode',
      model: promoCodeModelName,
      select: 'code',
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

  async findAllUserOrders(user: User, status?: OrderStatus) {
    return await this.ordersModel
      .find({
        user: user,
        status: status,
      })
      .populate(this.populatedPaths)
      .exec();
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
}
