import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CityModule } from './city/city.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    UserModule,
    AuthModule,
    AdminModule,
    CityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
