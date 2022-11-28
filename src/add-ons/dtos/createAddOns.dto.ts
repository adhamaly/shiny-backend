import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import { City } from '../../city/schemas/city.schema';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddOnsDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsMongoId()
  icon: ServiceIcon;

  @IsNotEmpty()
  @IsBoolean()
  selectAll: boolean;

  @IsArray()
  @IsOptional()
  cities: City[];
}
