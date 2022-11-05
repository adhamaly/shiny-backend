import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { City } from '../../city/schemas/city.schema';

export class CreateBikerDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  city: City;

  @IsNotEmpty()
  @IsString()
  nationalId: string;
}
