import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

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
  city: string;

  @IsNotEmpty()
  @IsString()
  nationalId: string;
}
