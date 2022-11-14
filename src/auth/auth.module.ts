import { Global, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';

@Global()
@Module({
  imports: [UserModule, AdminModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
