import { IsNotEmpty } from 'class-validator';

export class UserLoginDTO {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  fcmToken: string;
}
