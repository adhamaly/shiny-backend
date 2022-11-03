import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityModel = City & Document;

@Schema()
export class City {
  @Prop()
  name: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ default: true })
  isExist: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);
