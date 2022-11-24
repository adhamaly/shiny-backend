import { Injectable } from '@nestjs/common';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { AdminRepository } from './admin.repository';
import { City } from '../city/schemas/city.schema';
import { MethodNotAllowedResponse } from '../common/errors';

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async createSubAdmin(createSubAdminDTO: CreateSubAdminDTO) {
    return await this.adminRepository.createSubAdmin(createSubAdminDTO);
  }

  async getAdminByUserNameOr404(userName: string) {
    return await this.adminRepository.findAdminByUserNameOr404(userName);
  }

  async userNameIsAlreadyExits(userName: string) {
    return await this.adminRepository.userNameIsAlreadyExits(userName);
  }

  async getById(id: string) {
    return await this.adminRepository.findById(id);
  }

  async getByIdOr404(id: string) {
    return await this.adminRepository.findByIdOr404(id);
  }

  async CityPermissionForCreation(adminId: string, city: City) {
    const admin = await this.getByIdOr404(adminId);

    let isCityIncluded = false;
    if (admin.city.includes(city)) {
      isCityIncluded = true;
    }

    const hasPermission = admin.isSuperAdmin ? true : isCityIncluded;
    if (!hasPermission)
      throw new MethodNotAllowedResponse({
        ar: 'غير مصرح لك',
        en: 'You have no permission',
      });
  }

  async CitiesPermissionCreation(adminId: string, cities: City[]) {
    const admin = await this.getByIdOr404(adminId);

    let hasPermission = false;
    for (const city of cities) {
      if (admin.city.includes(city)) {
        hasPermission = true;
        continue;
      }
      hasPermission = false;
      if (!hasPermission)
        throw new MethodNotAllowedResponse({
          ar: 'غير مصرح لك',
          en: 'You have no permission to add in this city',
        });
    }
  }
}
