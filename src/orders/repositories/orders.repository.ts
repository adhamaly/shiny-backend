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
import {
  WashingServicesModelName,
  WashingService,
} from '../../washing-services/schemas/washing-services.schema';
import { addOnsModelName } from '../../add-ons/schemas/add-ons.schema';
import { vehicleModelName } from '../../vehicles/schemas/vehicles.schema';
import { Order } from '../schemas/orders.schema';
import { promoCodeModelName } from '../../promo-code/schemas/promo-code.schema';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { servicesIconModelName } from '../../services-icons/schemas/services-icons.schema';
import { Biker, bikerModelName } from '../../bikers/schemas/bikers.schema';
import { City, cityModelName } from '../../city/schemas/city.schema';
import { Roles } from 'src/admin/schemas/admin.schema';

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
      select: 'name price description duration',
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
      select: 'userName phone imageLink',
    },
    {
      path: 'biker',
      model: bikerModelName,
      select: 'userName phone imageLink imagePath latitude longitude rating',
    },
  ];

  populatedPathsForAdminView = [
    {
      path: 'washingServices',
      populate: {
        path: 'icon',
        select: 'iconPath iconLink',
        model: servicesIconModelName,
      },
      model: WashingServicesModelName,
      select: 'name price description duration',
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
      populate: {
        path: 'city',
        select: 'name',
        model: cityModelName,
      },
      model: locationModelName,
      select:
        'latitude longitude streetName subAdministrativeArea isSaved savedName',
    },
    {
      path: 'promoCode',
      model: promoCodeModelName,
      select: 'code',
    },
    {
      path: 'user',
      model: userModelName,
      select: 'userName phone imageLink',
    },
    {
      path: 'biker',
      model: bikerModelName,
      select: 'userName phone imageLink imagePath latitude longitude rating',
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
    washingServices: WashingService[],
  ) {
    const createdOrder = await this.ordersModel.create({
      user: user,
      washingServices: washingServices,
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
                  OrderStatus.WAITING_FOR_BIKER_BY_ADMIN,
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
      .sort({ createdAt: -1 })
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
                  OrderStatus.WAITING_FOR_BIKER_BY_ADMIN,
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

  ordersStatusFiltersForBiker(
    bikerId: string,
    status: string,
    locations: Location[],
  ) {
    if (status === OrderStatus.ACTIVE) {
      return {
        biker: bikerId,
        status: {
          $in: [
            OrderStatus.ACCEPTED_BY_BIKER,
            OrderStatus.BIKER_ON_THE_WAY,
            OrderStatus.BIKER_ARRIVED,
            OrderStatus.ON_WASHING,
          ],
        },
      };
    }
    if (status === 'PENDING') {
      return {
        status: OrderStatus.ACTIVE,
        location: { $in: locations },
      };
    }

    if (status === OrderStatus.COMPLETED) {
      return {
        biker: bikerId,
        status: OrderStatus.COMPLETED,
      };
    }
  }
  async findAllBikerOrders(
    bikerId: string,
    status: string,
    skip: number,
    limit: number,
    locations: Location[],
  ) {
    const orders = await this.ordersModel
      .find({
        ...this.ordersStatusFiltersForBiker(bikerId, status, locations),
      })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate(this.populatedPaths)
      .select({ biker: 0 })
      .exec();

    const count = await this.ordersModel
      .count({
        ...this.ordersStatusFiltersForBiker(bikerId, status, locations),
      })
      .exec();

    return { orders, count };
  }

  async getBikerRatedOrders(bikerId: string | Biker) {
    return await this.ordersModel.find({
      biker: bikerId,
      ratingOfBiker: { $gte: 0 },
    });
  }

  async getUserRatedOrders(userId: string | User) {
    return await this.ordersModel.find({
      user: userId,
      ratingOfUser: { $gte: 0 },
    });
  }

  async findAllByAdmin(
    skip: number,
    limit: number,
    role: string,
    status?: OrderStatus[],
    cities?: City[],
  ) {
    const orders = await this.ordersModel.aggregate([
      {
        $match: { ...(status?.length ? { status: { $in: status } } : {}) },
      },
      {
        $lookup: {
          from: locationModelName,
          let: { locationId: '$location' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$locationId'] },
                    {
                      ...(role === Roles.SubAdmin
                        ? { $in: ['$city', cities] }
                        : {}),
                    },
                  ],
                },
              },
            },
          ],
          as: 'order_location',
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    await this.ordersModel.populate(
      orders[0]['data'],
      this.populatedPathsForAdminView,
    );

    orders[0]['data']?.forEach((order: any) => {
      order['order_location'] = undefined;
    });
    return {
      orders: orders[0]['data'],
      count: orders[0]['metadata']?.length
        ? orders[0]['metadata'][0]['count']
        : 0,
    };

    // const orders = await this.ordersModel
    //   .find({
    //     ...(status?.length ? { status: { $in: status } } : {}),
    //     ...(role === Roles.SuperAdmin
    //       ? {}
    //       : { 'location.city': { $in: cities } }),
    //   })
    //   .skip(skip)
    //   .limit(limit)
    //   .sort({ updatedAt: -1 })
    //   .populate(this.populatedPathsForAdminView)
    //   .exec();

    // const count = await this.ordersModel
    //   .countDocuments({
    //     ...(status?.length ? { status: { $in: status } } : {}),
    //     ...(role === Roles.SuperAdmin
    //       ? {}
    //       : { 'location.city': { $in: cities } }),
    //   })
    //   .exec();

    // return { orders, count };
  }

  async findAllAssignedByAdmin(skip: number, limit: number, adminId: string) {
    const orders = await this.ordersModel
      .find({ assignedBy: adminId })
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .populate(this.populatedPathsForAdminView)
      .exec();

    const count = await this.ordersModel
      .countDocuments({ assignedBy: adminId })
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
  async findOrderWithCityByIdPopulatedOr404(id: string) {
    const order = await this.ordersModel
      .findById(id)
      .populate(this.populatedPathsForAdminView)
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
