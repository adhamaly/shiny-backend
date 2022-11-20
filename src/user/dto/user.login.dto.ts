import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UserLoginDTO {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  fcmToken: string;
}
