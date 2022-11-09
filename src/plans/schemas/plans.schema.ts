import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { WashingService } from '../../washing-services/schemas/washing-services.schema';
import mongoose from 'mongoose';

export type PlansModel = Plan & Document;

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

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: WashingService.name }])
  washingServices: WashingService[];

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PlansSchema = SchemaFactory.createForClass(Plan);
