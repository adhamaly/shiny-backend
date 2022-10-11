import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRegisterDTO, UserLoginDTO } from 'src/user/dto';

@Injectable()
export class AuthService {
  private saltOfRounds = Number(process.env.SALT_OF_ROUND);
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async userRegisteration(userRegisterDTO: UserRegisterDTO) {
    // Create User
    const userDocument = await this.userService.create(userRegisterDTO);

    // Generate Tokens
    const accessToken = this.generateAccessToken(userDocument._id, 'user');
    const refreshToken = this.generateRefreshToken(userDocument._id, 'user');

    return {
      ...userDocument,
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
      ...userDocument,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async checkUserPhoneExistance(phone: string) {
    return await this.userService.isPhoneExist(phone);
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

  decodeExpiredToken(accessToken: string) {
    try {
      return this.jwtService.verify(accessToken.trim(), {
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
}
