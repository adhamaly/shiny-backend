import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { City, cityModelName } from '../../city/schemas/city.schema';
import { Admin, adminModelName } from '../../admin/schemas/admin.schema';

export type BikerModel = Biker & Document;
export const bikerModelName = 'biker';
export enum BikerStatus {
  ACTIVE = 'ACTIVE',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  SUSPENDED = 'SUSPENDED',
}
@Schema({ timestamps: true })
export class Biker {
  @Prop()
  userName: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  phone: string;

  @Prop()
  imagePath: string;

  @Prop()
  imageLink: string;

  @Prop()
  socketId: string;

  @Prop({ type: [{ type: String }], select: false })
  fcmTokens: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  streetName: string;

  @Prop()
  subAdministrativeArea: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: cityModelName })
  city: City;

  @Prop()
  nationalId: string;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: adminModelName })
  createdBy: Admin;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: adminModelName })
  updatedBy: Admin;

  @Prop({ default: 'ar' })
  language: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: 0 })
  rating: number;
}

export const BikersSchema = SchemaFactory.createForClass(Biker);
