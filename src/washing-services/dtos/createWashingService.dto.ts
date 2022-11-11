import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import { City } from '../../city/schemas/city.schema';

export class CreateWashingServiceDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  duration: number;

  @IsNotEmpty()
  @IsString()
  durationUnit: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  pointsToPay: number;

  @IsNotEmpty()
  @IsMongoId()
  icon: ServiceIcon;

  @IsNotEmpty()
  @IsBoolean()
  selectAll: boolean;

  @IsNotEmpty()
  @IsArray()
  cities: City[];
}
