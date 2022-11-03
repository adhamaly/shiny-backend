import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { City } from '../../city/schemas/city.schema';

export type AdminModel = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop()
  userName: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'city' }] })
  city: City[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
