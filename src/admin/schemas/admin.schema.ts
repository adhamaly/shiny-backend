import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { City, cityModelName } from '../../city/schemas/city.schema';

export type AdminModel = Admin & Document;
export const adminModelName = 'admin';
export enum Roles {
  SuperAdmin = 'superAdmin',
  SubAdmin = 'subAdmin',
}
@Schema({ timestamps: true })
export class Admin {
  @Prop()
  userName: string;

  @Prop()
  phone: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: cityModelName }],
  })
  city: City[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
