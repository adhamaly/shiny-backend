import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { WashingService } from '../../washing-services/schemas/washing-services.schema';
export class UpdatePlanDTO {
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
  pointsToPay: number;

  @IsArray()
  @IsNotEmpty({ each: true })
  washingServices: WashingService[];

  @IsNotEmpty()
  usageCount: number;
}
