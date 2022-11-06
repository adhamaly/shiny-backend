import { IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  icon: string;
}
