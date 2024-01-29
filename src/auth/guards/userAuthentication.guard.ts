import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/common/services/app-config';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(AppConfig) private appConfig: AppConfig,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const access_token = request.headers['authorization'].split(' ')[1];
      const payload = this.jwtService.verify(access_token, {
        secret: this.appConfig.USER_JWT_SECRET,
      });
      request.account = { id: payload.id, role: payload.role };
      if (payload.id) return true;
      return false;
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
