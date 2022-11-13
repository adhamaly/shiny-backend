import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CityModel = HydratedDocument<City>;
export const cityModelName = 'city';
@Schema()
export class City {
  @Prop(
    raw({
      ar: { type: String },
      en: { type: String },
    }),
  )
  name: Record<string, any>;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ default: true })
  isExist: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);
