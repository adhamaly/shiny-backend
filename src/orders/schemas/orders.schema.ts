import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, userModelName } from '../../user/schemas/user.schema';
import { Biker, bikerModelName } from '../../bikers/schemas/bikers.schema';
import { AddOns, addOnsModelName } from '../../add-ons/schemas/add-ons.schema';
import {
  PromoCode,
  promoCodeModelName,
} from '../../promo-code/schemas/promo-code.schema';
import {
  Subscription,
  subscriptionsModelName,
} from '../../subscriptions/schemas/subscriptions.schema';
import {
  Location,
  locationModelName,
} from '../../locations/schemas/location.schema';
import {
  Vehicle,
  vehicleModelName,
} from '../../vehicles/schemas/vehicles.schema';
import {
  WashingService,
  WashingServicesModelName,
} from '../../washing-services/schemas/washing-services.schema';

export type OrdersModel = Order & Document;
export const ordersModelName = 'order';
export enum OrderStatus {
  PENDING_USER_PAYMENT = 'PENDING_USER_PAYMENT',
  PENDING_USER_REVIEW = 'PENDING_USER_REVIEW',
  ACTIVE = 'ACTIVE',
  CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  ACCEPTED_BY_BIKER = 'ACCEPTED_BY_BIKER',
  WAITING_FOR_BIKER_BY_ADMIN = 'WAITING_FOR_BIKER_BY_ADMIN',
  BIKER_ON_THE_WAY = 'BIKER_ON_THE_WAY',
  CANCELLED_BY_BIKER = 'CANCELLED_BY_BIKER',
  BIKER_ARRIVED = 'BIKER_ARRIVED',
  ON_WASHING = 'ON_WASHING',
  COMPLETED = 'COMPLETED',
}
export enum OrderTypes {
  SUBSCRIPTION_BOOKING = 'SUBSCRIPTION_BOOKING',
  SERVICE_BOOKING = 'SERVICE_BOOKING',
}
export enum PaymentTypes {
  WALLET = 'WALLET',
  CREDIT = 'CREDIT',
  SUBSCRIBED = 'SUBSCRIBED',
}

/*
    TODO:-(PromoCode) as a foriegn-key
  */

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: userModelName })
  user: User;

  @Prop({
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: WashingServicesModelName },
    ],
  })
  washingServices: WashingService[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: addOnsModelName }],
  })
  addOns: AddOns[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: vehicleModelName })
  vehicle: Vehicle;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: locationModelName })
  location: Location;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: bikerModelName })
  biker: Biker; // Setted when biker Accept Order

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: subscriptionsModelName })
  subscription: Subscription;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: promoCodeModelName })
  promoCode: PromoCode;

  @Prop()
  startTime: string;

  @Prop()
  endTime: string; // Setted From Biker when Update Order status TO "COMPLETED"

  @Prop()
  totalDuration: number; // Setted From WashingServices Durations while placing order

  @Prop({})
  status: string;

  @Prop()
  description: string;

  @Prop()
  type: string;

  @Prop()
  paymentType: string;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  totalPay: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  OnTheWayAt: Date;

  @Prop()
  onWashingAt: Date;
}

export const OrdersSchema = SchemaFactory.createForClass(Order);
