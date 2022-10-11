import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UserRegisterDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;
}
