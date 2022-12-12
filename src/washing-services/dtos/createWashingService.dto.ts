import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import { City } from '../../city/schemas/city.schema';

export class CreateWashingServiceDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  description: string[];

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

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cities?: City[];
}
