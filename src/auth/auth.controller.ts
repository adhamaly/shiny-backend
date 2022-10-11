import { Body, Controller, Post } from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from 'src/user/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('users/register')
  async userRegisterationController(@Body() userRegisterDTO: UserRegisterDTO) {
    return {
      success: true,
      data: {
        ...(await this.authService.userRegisteration(userRegisterDTO)),
      },
    };
  }
  @Post('users/login')
  async userLoginController(@Body() userLoginDTO: UserLoginDTO) {
    return {
      success: true,
      data: { ...(await this.authService.userLogin(userLoginDTO)) },
    };
  }
  @Post('users/check-phone')
  async checkPhoneExistanceController(@Body('phone') phone: string) {
    return {
      success: true,
      isExist: await this.authService.checkUserPhoneExistance(phone),
    };
  }
}
