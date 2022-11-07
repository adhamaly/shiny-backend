import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import mongoose from 'mongoose';

export type WashingServicesModel = WashingService & Document;

@Schema({ timestamps: true })
export class WashingService {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  duration: number;

  @Prop()
  durationUnit: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  pointsToPay: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ServiceIcon.name })
  icon: ServiceIcon;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WashingServicesSchema =
  SchemaFactory.createForClass(WashingService);
