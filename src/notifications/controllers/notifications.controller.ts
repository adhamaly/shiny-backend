import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { Account } from 'src/common/decorators/user.decorator';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(UserAuthGuard)
  async getNotificationsController(@Account() account: any) {
    return {
      success: true,
      data: await this.notificationsService.getAllNotificationsForReceiver(
        account.id,
      ),
    };
  }

  @Patch('set-read')
  @UseGuards(UserAuthGuard)
  async setNotificationRead(@Param('notificationId') notificationId: string) {
    await this.notificationsService.setNotificationIsRead(notificationId);
    return {
      success: true,
    };
  }
}
