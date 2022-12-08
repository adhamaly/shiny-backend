import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { WashingService } from '../../washing-services/schemas/washing-services.schema';
import { AddOns } from '../../add-ons/schemas/add-ons.schema';
import { Vehicle } from '../../vehicles/schemas/vehicles.schema';
import { Subscription } from '../../subscriptions/schemas/subscriptions.schema';

class LocationDTO {
  @Matches(/(-\d+\.\d\d\d\d\d+|\d+.\d\d\d\d\d+)/i, {
    message: 'Latitude must be in the format X.dddddd+',
  })
  latitude: string;

  @Matches(/(-\d+\.\d\d\d\d\d+|\d+.\d\d\d\d\d+)/i, {
    message: 'Longitude must be in the format X.dddddd+',
  })
  longitude: string;

  @IsNotEmpty()
  @IsString()
  streetName: string;

  @IsOptional()
  @IsString()
  subAdministrativeArea: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

export class OrderCreationDTO {
  @IsOptional()
  @IsArray()
  washingServices: WashingService[];

  @IsOptional()
  @IsArray()
  addOns: AddOns[];

  @IsNotEmpty()
  vehicle: Vehicle;

  @IsNotEmptyObject()
  location: LocationDTO;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  totalPay: number;

  @IsOptional()
  subscription: Subscription;
}
