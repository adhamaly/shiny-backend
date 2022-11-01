import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserLoginDTO, UserLogoutDTO, UserRegisterDTO } from 'src/user/dto';
import { AuthService } from './auth.service';
import { AdminLoginDTO } from '../admin/dto/admin.login.dto';
import { UserAuthGuard } from './guards';
import { UserAuthorizedGuard } from '../user/guard/userAuthorized.guard';

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

  @Post('users/logout')
  @UseGuards(UserAuthGuard, UserAuthorizedGuard)
  async userLogoutController(@Body() userLogoutDTO: UserLogoutDTO) {
    await this.authService.userLogout(userLogoutDTO);
    return {
      success: true,
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
  async refreshTokenHandler(@Body('refresh_token') refresh_token: string) {
    const result = await this.authService.generateNewTokens(refresh_token);

    return { success: true, data: { ...result } };
  }
}
