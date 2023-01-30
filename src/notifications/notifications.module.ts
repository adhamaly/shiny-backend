import { Module } from '@nestjs/common';
import { FirebaseModule } from '../common/services/firebase/firebase.module';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import {
  notificationsModelName,
  NotificationsSchema,
} from './schemas/notifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: notificationsModelName, schema: NotificationsSchema },
    ]),
    FirebaseModule,
    UserModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
