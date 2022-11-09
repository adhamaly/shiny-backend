import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { WashingService } from '../../washing-services/schemas/washing-services.schema';
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
  washingServices: WashingService[];
}
