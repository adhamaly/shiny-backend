import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenResponse } from '../../common/errors/ForbiddenResponse';
import { VehiclesService } from '../vehicles.service';

@Injectable()
export class IsVehicleOwnerOrAdmin implements CanActivate {
  constructor(private vehiclesService: VehiclesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId: string = request.account.id;
    const vehicleId: string = request.params.vehicleId;

    const vehicle = await this.vehiclesService.getByIdOr404(vehicleId);
    if (vehicle.user.toString() === userId.toString()) return true;

    if (
      request.account.role === 'superAdmin' ||
      request.account.role === 'subAdmin'
    )
      return true;
    throw new ForbiddenResponse({
      ar: 'غير مصرح لك ',
      en: 'You have no privileges to perform an this action',
    });
  }
}
