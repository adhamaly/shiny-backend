import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UserUpdateProfileDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  gender: string;
}
