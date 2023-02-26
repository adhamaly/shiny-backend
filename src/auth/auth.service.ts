import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRegisterDTO, UserLoginDTO } from '../user/dto';
import { AdminLoginDTO } from '../admin/dto/admin.login.dto';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';
import { UnAuthorizedResponse } from '../common/errors/UnAuthorizedResponse';
import { NotFoundResponse } from '../common/errors';
import { UserLogoutDTO } from '../user/dto/userLogout.dto';
import { Roles } from 'src/admin/schemas/admin.schema';
import { BikerLoginDTO } from '../bikers/dto/bikerLogin.dto';
import { BikersService } from '../bikers/services/bikers.service';
import { BikerLogoutDTO } from '../bikers/dto/bikerLogout.dto';
import { ResetPasswordDTO } from './dtos/resetPassword.dto';
import { Socket } from 'socket.io';
import { ForbiddenResponse } from '../common/errors/ForbiddenResponse';
import { FCMService } from 'src/common/services/firebase/fcm.service';
import { FcmTopics } from 'src/common/enums/topics.enum';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private adminService: AdminService,
    private bikersService: BikersService,
    private fcmService: FCMService,
  ) {}

  async userRegisteration(userRegisterDTO: UserRegisterDTO) {
    // Create User
    const userDocument = await this.userService.create(userRegisterDTO);

    // Generate Tokens
    const accessToken = this.generateAccessToken(userDocument._id, 'user');
    const refreshToken = this.generateRefreshToken(userDocument._id, 'user');

    await this.fcmService.subscribeToTopic(
      userRegisterDTO.fcmToken,
      FcmTopics.PROMO_CODE_CREATED,
    );

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

    if (userDocument.isAllowNotification) {
      if (!userDocument.fcmTokens?.includes(userLoginDTO.fcmToken)) {
        userDocument.fcmTokens.push(userLoginDTO.fcmToken);
        await userDocument.save();

        await this.fcmService.subscribeToTopic(
          userLoginDTO.fcmToken,
          FcmTopics.PROMO_CODE_CREATED,
        );
      }
    }
    // Generate Tokens
    const accessToken = this.generateAccessToken(userDocument._id, 'user');
    const refreshToken = this.generateRefreshToken(userDocument._id, 'user');

    return {
      ...userDocument.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
      fcmTokens: undefined,
    };
  }

  async bikerLogin(bikerLoginDTO: BikerLoginDTO) {
    //TODO: Add FcmToken Of Biker To BikerModel but check it Existance
    const biker = await this.bikersService.getBikerByUserNameOr404(
      bikerLoginDTO.userName,
    );

    // Decrypt biker password and Compare
    const isMatch = await bcrypt.compare(
      bikerLoginDTO.password,
      biker.password,
    );
    if (!isMatch)
      throw new UnAuthorizedResponse({
        ar: 'بيانات المستخدم غير صالحة',
        en: 'Invalid user credentials ',
      });

    if (!biker.fcmTokens?.includes(bikerLoginDTO.fcmToken)) {
      biker.fcmTokens.push(bikerLoginDTO.fcmToken);
      await biker.save();
    }

    // Generate Tokens
    const accessToken = this.generateAccessToken(biker._id, 'biker');
    const refreshToken = this.generateRefreshToken(biker._id, 'biker');

    biker.password = undefined;
    return {
      ...biker.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
      fcmTokens: undefined,
    };
  }

  async userLogout(userId: string, userLogoutDTO: UserLogoutDTO) {
    await this.userService.removeInvalidFcmToken(
      userId,
      userLogoutDTO.fcmToken,
    );
  }

  async bikerLogout(bikerId: string, bikerLogoutDTO: BikerLogoutDTO) {
    await this.bikersService.removeInvalidFcmTokenForBiker(
      bikerId,
      bikerLogoutDTO.fcmToken,
    );
  }

  async checkUserPhoneExistence(phone: string) {
    return await this.userService.isPhoneExist(phone);
  }

  async checkBikerPhoneExistence(phone: string) {
    const biker = await this.bikersService.checkPhoneNumber(phone);
    if (biker) {
      const token = this.generateAccessToken(biker._id, 'biker', '10m');
      return {
        isExist: true,
        token,
      };
    }

    return {
      isExist: false,
    };
  }

  async resetPasswordForBiker(resetPasswordDTO: ResetPasswordDTO) {
    const payload = this.decodeAccessToken(resetPasswordDTO.token);
    await this.bikersService.resetPassword(
      payload.id,
      resetPasswordDTO.newPassword,
    );
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
      admin.isSuperAdmin ? Roles.SuperAdmin : Roles.SubAdmin,
    );
    const refreshToken = this.generateRefreshToken(
      admin._id,
      admin.isSuperAdmin ? Roles.SuperAdmin : Roles.SubAdmin,
    );

    admin.password = undefined;
    return {
      ...admin.toObject(),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  generateAccessToken(id: any, role: string, expiresIn?: string) {
    return this.jwtService.sign(
      {
        id: id,
        role: role,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: expiresIn ? expiresIn : '2h',
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

    // Check CLientUser Existence
    const clientProfile = await this.getUserByIdAndRole(
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

  decodeAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
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

  async getUserByIdAndRole(clientId: string, role: string) {
    if (role === Roles.SuperAdmin || role === Roles.SubAdmin) {
      const adminProfile = await this.adminService.getByIdOr404(clientId);
      return adminProfile;
    }

    if (role === 'user') {
      const userProfile = await this.userService.getUserByIdOr404(clientId);
      return userProfile;
    }

    if (role === 'biker') {
      const bikerProfile = await this.bikersService.getByIdOr404(clientId);
      return bikerProfile;
    }
  }
  authenticateSocketUser(socket: Socket) {
    if (!socket.handshake.headers['authorization'].split(' ')[1])
      throw new ForbiddenResponse({
        en: 'Not Authenticated',
        ar: 'غير مصدق للدخول',
      });
    try {
      const token = socket.handshake.headers['authorization'].split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      return { id: payload.id, role: payload.role };
    } catch {
      socket.disconnect();
    }
  }
  async updateUserSocketId(userId: string, role: string, socketId: string) {
    if (role === 'user') {
      await this.userService.updateUserSocketId(userId, socketId);
    }

    if (role === 'biker') {
      await this.bikersService.updateBikerSocketId(userId, socketId);
    }
  }
}
