import { IsNotEmpty, IsString } from 'class-validator';
import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';

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
  icon: ServiceIcon;
}
