import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserLoginDTO, UserLogoutDTO, UserRegisterDTO } from '../user/dto';
import { AuthService } from './auth.service';
import { AdminLoginDTO } from '../admin/dto/admin.login.dto';
import { UserAuthGuard } from './guards';
import { UserAuthorizedGuard } from '../user/guard/userAuthorized.guard';
import { BikerLoginDTO } from '../bikers/dto/bikerLogin.dto';
import { BikerLogoutDTO } from '../bikers/dto/bikerLogout.dto';
import { BikerProfileOwnerGuard } from '../bikers/guard/bikerProfileOwner.guard';

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
  async checkPhoneExistenceController(@Body('phone') phone: string) {
    return {
      success: true,
      isExist: await this.authService.checkUserPhoneExistence(phone),
    };
  }

  @Post('admins/login')
  async adminLoginController(@Body() adminLoginDTO: AdminLoginDTO) {
    return {
      success: true,
      data: { ...(await this.authService.adminLogin(adminLoginDTO)) },
    };
  }

  @Post('bikers/login')
  async bikerLoginController(@Body() bikerLoginDTO: BikerLoginDTO) {
    return {
      success: true,
      data: { ...(await this.authService.bikerLogin(bikerLoginDTO)) },
    };
  }

  @Post('bikers/logout')
  @UseGuards(UserAuthGuard)
  async bikerLogoutController(@Body() bikerLogoutDTO: BikerLogoutDTO) {
    await this.authService.bikerLogout(bikerLogoutDTO);
    return {
      success: true,
    };
  }
  @Post('refresh-token')
  async refreshTokenHandler(@Body('refresh_token') refresh_token: string) {
    const result = await this.authService.generateNewTokens(refresh_token);

    return { success: true, data: { ...result } };
  }
}
