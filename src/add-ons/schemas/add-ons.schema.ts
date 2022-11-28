import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ServiceIcon,
  servicesIconModelName,
} from '../../services-icons/schemas/services-icons.schema';
import mongoose from 'mongoose';

export type AddOnsModel = AddOns & Document;
export const addOnsModelName = 'add-ons';

@Schema({ timestamps: true })
export class AddOns {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: servicesIconModelName })
  icon: ServiceIcon;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AddOnsSchema = SchemaFactory.createForClass(AddOns);
