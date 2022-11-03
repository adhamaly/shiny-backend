import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Admin } from 'src/admin/schemas/admin.schema';
import { City } from 'src/city/schemas/city.schema';

export type BikerModel = Biker & Document;

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'city' })
  city: City;

  @Prop()
  nationalId: string;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'admin' })
  createdBy: Admin;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'admin' })
  updatedBy: Admin;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BikersSchema = SchemaFactory.createForClass(Biker);
