import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { WashingService } from '../../washing-services/schemas/washing-services.schema';
import { City } from '../../city/schemas/city.schema';
export class CreatePlanDTO {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  duration: number;

  @IsNotEmpty()
  @IsString()
  durationUnit: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  washingServices: WashingService[];

  @IsNotEmpty()
  usageCount: number;

  @IsNotEmpty()
  pointsToPay: number;

  @IsNotEmpty()
  @IsBoolean()
  selectAll: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cities?: City[];
}
