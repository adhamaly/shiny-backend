import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenResponse } from '..//../common/errors/ForbiddenResponse';
import { UserService } from '../user.service';

@Injectable()
export class ProfileOwnerOrAuthClientGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get Request Object
    const request = context.switchToHttp().getRequest();

    const clientId: string = request.account.id;
    const profileId: string = request.params.userId;

    if (request.account.role === 'user') {
      // Check if user is ProfileOwner
      const user = await this.userService.getUserByIdOr404(clientId);
      if (user._id.toString() === profileId.toString()) return true;
    }

    if (
      request.account.role === 'subAdmin' ||
      request.account.role === 'superAdmin' ||
      request.account.role === 'biker'
    )
      return true;

    throw new ForbiddenResponse({
      ar: 'غير مصرح لك ',
      en: 'You have no privileges to perform an this action',
    });
  }
}
