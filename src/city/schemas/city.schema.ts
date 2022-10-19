import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityModel = City & Document;

@Schema()
export class City {
  @Prop()
  name: string;
}

export const CitySchema = SchemaFactory.createForClass(City);