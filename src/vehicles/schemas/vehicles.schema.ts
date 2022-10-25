import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type VehicleModel = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop()
  type: string;

  @Prop()
  brand: string;

  @Prop()
  model: string;

  @Prop()
  plateNumber: string;

  @Prop()
  color: string;

  @Prop()
  imageLink: string;

  @Prop()
  imagePath: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'user' })
  user: User;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
