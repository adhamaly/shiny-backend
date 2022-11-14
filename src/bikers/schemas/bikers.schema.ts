import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { City, cityModelName } from '../../city/schemas/city.schema';
import { Admin, adminModelName } from '../../admin/schemas/admin.schema';

export type BikerModel = Biker & Document;
export const bikerModelName = 'biker';

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

  @Prop({ type: [{ type: String }] })
  fcmTokens: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BikersSchema = SchemaFactory.createForClass(Biker);
