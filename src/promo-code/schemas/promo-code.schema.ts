import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PromoCodesModel = PromoCode & Document;
export const promoCodeModelName = 'promo-code';
export enum PromoCodeStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}
@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ type: String, trim: true })
  code: string;

  @Prop()
  expiryDate: Date;

  @Prop()
  discountPercentage: number;

  @Prop({ default: PromoCodeStatus.ACTIVE })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
