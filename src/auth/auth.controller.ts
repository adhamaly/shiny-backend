import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from 'src/user/dto';
import { AuthService } from './auth.service';
import { AdminLoginDTO } from '../admin/dto/admin.login.dto';
import { UserAuthGuard } from './guards';

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

  @Post('admins/login')
  async adminLoginController(@Body() adminLoginDTO: AdminLoginDTO) {
    return {
      success: true,
      data: { ...(await this.authService.adminLogin(adminLoginDTO)) },
    };
  }
  @Post('refresh-token')
  refreshTokenHandler(@Body('refresh_token') refresh_token: string) {
    const result = this.authService.generateNewTokens(refresh_token);

    return { success: true, data: { ...result } };
  }
}
