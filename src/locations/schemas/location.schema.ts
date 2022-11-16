import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { City, cityModelName } from '../../city/schemas/city.schema';
import { User, userModelName } from '../../user/schemas/user.schema';

export type LocationsModel = Location & Document;
export const locationModelName = 'locations';

@Schema({ timestamps: true })
export class Location {
  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  streetName: string;

  @Prop()
  subAdministrativeArea: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: cityModelName })
  city: City;

  @Prop()
  country: string;

  @Prop({ default: false })
  isSaved: boolean;

  @Prop()
  savedName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: userModelName })
  user: User;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
