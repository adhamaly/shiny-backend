import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePromoCodeDTO {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  discountPercentage: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;
}
