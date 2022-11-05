import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRegisterDTO, UserLoginDTO } from 'src/user/dto';
import { AdminLoginDTO } from '../admin/dto/admin.login.dto';
import { AdminService } from 'src/admin/admin.service';
import * as bcrypt from 'bcrypt';
import { UnAuthorizedResponse } from 'src/common/errors/UnAuthorizedResponse';
import { MethodNotAllowedResponse, NotFoundResponse } from 'src/common/errors';
import { UserLogoutDTO } from '../user/dto/userLogout.dto';

@Injectable()
export class AuthService {
  private saltOfRounds = Number(process.env.SALT_OF_ROUND);
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private adminService: AdminService,
  ) {}

  async userRegisteration(userRegisterDTO: UserRegisterDTO) {
    // Create User
    const userDocument = await this.userService.create(userRegisterDTO);

    // Generate Tokens
    const accessToken = this.generateAccessToken(userDocument._id, 'user');
    const refreshToken = this.generateRefreshToken(userDocument._id, 'user');

    return {
      ...userDocument.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async userLogin(userLoginDTO: UserLoginDTO) {
    const userDocument = await this.userService.getUserByPhoneOr404(
      userLoginDTO.phone,
    );

    // Generate Tokens
    const accessToken = this.generateAccessToken(userDocument._id, 'user');
    const refreshToken = this.generateRefreshToken(userDocument._id, 'user');

    return {
      ...userDocument.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async userLogout(userLogoutDTO: UserLogoutDTO) {
    //TODO:REMOVE FCM FROM USERMOEL
  }

  async checkUserPhoneExistance(phone: string) {
    return await this.userService.isPhoneExist(phone);
  }

  async adminLogin(adminLoginDTO: AdminLoginDTO) {
    // Get Admin
    const admin = await this.adminService.getAdminByUserNameOr404(
      adminLoginDTO.userName,
    );

    // Decrypt Admin password and Compare
    const isMatch = await bcrypt.compare(
      adminLoginDTO.password,
      admin.password,
    );
    if (!isMatch)
      throw new UnAuthorizedResponse({
        ar: 'بيانات المستخدم غير صالحة',
        en: 'Invalid user credentials ',
      });

    // Generate Tokens
    const accessToken = this.generateAccessToken(
      admin._id,
      admin.isSuperAdmin ? 'superAdmin' : 'subAdmin',
    );
    const refreshToken = this.generateRefreshToken(
      admin._id,
      admin.isSuperAdmin ? 'superAdmin' : 'subAdmin',
    );

    admin.password = undefined;
    return {
      ...admin.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  generateAccessToken(id: any, role: string) {
    return this.jwtService.sign(
      {
        id: id,
        role: role,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '2h',
      },
    );
  }
  generateRefreshToken(id: any, role: string) {
    return this.jwtService.sign(
      {
        id: id,
        role: role,
      },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      },
    );
  }
  async generateNewTokens(refresh_token: string) {
    if (!refresh_token)
      throw new NotFoundResponse({ ar: 'لا يوجد', en: 'not found' });

    // decode refreshToken
    const payload = this.decodeRefreshToken(refresh_token);

    // Check CLientUser Existance
    const clientProfile = await this.checkClientUserExistance(
      payload.id,
      payload.role,
    );
    // Generate Tokens
    const accessToken = this.generateAccessToken(
      clientProfile._id.toString(),
      payload.role,
    );
    const refreshToken = this.generateRefreshToken(
      clientProfile._id.toString(),
      payload.role,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  decodeRefreshToken(refreshToken: string) {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new ForbiddenException({
        success: false,
        message: {
          en: 'Not Authenticated',
          ar: 'غير مصدق للدخول',
        },
      });
    }
  }

  async checkClientUserExistance(clientId: string, role: string) {
    if (role === 'superAdmin' || role === 'subAdmin') {
      const adminProfile = await this.adminService.getByIdOr404(clientId);
      return adminProfile;
    }

    if (role === 'user') {
      const userProfile = await this.userService.getUserByIdOr404(clientId);
      return userProfile;
    }
  }
}
