import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WashingServicesModel = WashingService & Document;

@Schema({ timestamps: true })
export class WashingService {
  @Prop()
  name: string;

  @Prop()
  duration: number;

  @Prop()
  durationUnit: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  pointsToPay: number;

  @Prop()
  iconPath: string;

  @Prop()
  iconLink: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WashingServicesSchema =
  SchemaFactory.createForClass(WashingService);
