import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, userModelName } from '../../user/schemas/user.schema';
import { Biker, bikerModelName } from '../../bikers/schemas/bikers.schema';
import { AddOns, addOnsModelName } from '../../add-ons/schemas/add-ons.schema';
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
  PAID = 'PAID',
  CANCELLED_FROM_USER = 'CANCELLED_FROM_USER',
  ACCEPTED_FROM_BIKER = 'ACCEPTED_FROM_BIKER',
  WAITING_BIKER_ACCEPTANCE = 'WAITING_BIKER_ACCEPTANCE',
  AWAITING_BIKER_DELIVERY = 'AWAITING_BIKER_DELIVERY',
  CANCELLED_FROM_BIKER = 'CANCELLED_FROM_BIKER',
  ON_WASHING = 'ON_WASHING',
  COMPLETED = 'COMPLETED',
}
export enum OrderTypes {
  SUBSCRIPTION_BOOKING = 'SUBSCRIPTION_BOOKING',
  SERVICE_BOOKING = 'SERVICE_BOOKING',
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

  @Prop()
  walletUsedAmount: number; // Setted when user Apply WalletAmount Usage

  @Prop()
  startTime: string;

  @Prop()
  endTime: string; // Setted From Biker when Update Order status TO "COMPLETED"

  @Prop()
  totalDuration: string; // Setted From WashingServices Durations while placing order

  @Prop({ default: OrderStatus.PENDING_USER_PAYMENT })
  status: string;

  @Prop()
  description: string;

  @Prop()
  type: string;

  @Prop()
  totalPay: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrdersSchema = SchemaFactory.createForClass(Order);
