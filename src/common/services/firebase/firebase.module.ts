import { Module, forwardRef } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FCMService } from './fcm.service';
import { UserModule } from '../../../user/user.module';
import { BikersModule } from '../../../bikers/bikers.module';
@Module({
  imports: [],
  controllers: [],
  providers: [FirebaseService, FCMService],
  exports: [FirebaseService, FCMService],
})
export class FirebaseModule {}
