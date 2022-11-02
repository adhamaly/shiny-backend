import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { City } from 'src/city/schemas/city.schema';

export class UpdateBikerDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  city: City;

  @IsNotEmpty()
  @IsString()
  nationalId: string;
}
