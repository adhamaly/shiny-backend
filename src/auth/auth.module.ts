import { Global, Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { BikersModule } from '../bikers/bikers.module';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { AppConfig } from 'src/common/services/app-config';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [
    PassportModule.register({ session: false, property: 'persona' }),
    UserModule,
    AdminModule,
    forwardRef(() => BikersModule),
    FirebaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AppConfig],
  exports: [AuthService],
})
export class AuthModule {}
