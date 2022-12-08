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
      totalPay: orderCreationDTO.totalPay,
      subscription: orderCreationDTO.subscription,
      status: orderStatus,
    });

    return createdOrder;
  }

  async findAllUserOrders(user: User, status?: OrderStatus) {
    return await this.ordersModel
      .find({
        user: user,
      })
      .populate(this.populatedPaths)
      .exec();
  }
  async findOrderById(order: string) {
    return await this.ordersModel.findById(order).exec();
  }
}
