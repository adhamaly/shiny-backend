import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class UserRegisterDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  fcmToken: string;
}
