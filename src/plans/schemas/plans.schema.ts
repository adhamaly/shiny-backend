import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  WashingService,
  WashingServicesModelName,
} from '../../washing-services/schemas/washing-services.schema';
import mongoose from 'mongoose';

export type PlansModel = Plan & Document;
export const plansModelName = 'plan';

@Schema({ timestamps: true })
export class Plan {
  @Prop()
  type: string;

  @Prop()
  color: string;

  @Prop({ default: 0 })
  price: number;

  @Prop()
  duration: number;

  @Prop()
  durationUnit: string;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: 0 })
  pointsToPay: number;

  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: WashingServicesModelName },
  ])
  washingServices: WashingService[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PlansSchema = SchemaFactory.createForClass(Plan);
