import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';

export class UpdateWashingServiceDTO {
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
  @IsMongoId()
  icon: ServiceIcon;
}
