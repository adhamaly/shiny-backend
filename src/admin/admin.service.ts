import { Injectable } from '@nestjs/common';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { AdminRepository } from './admin.repository';
import { City } from 'src/city/schemas/city.schema';
import { MethodNotAllowedResponse } from 'src/common/errors';

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

  async CityPermissionForBikerCreation(adminId: string, bikerCity: City) {
    const admin = await this.getByIdOr404(adminId);

    let hasPermission = false;
    if (admin.city.includes(bikerCity)) {
      hasPermission = true;
    }

    const permissionResult = admin.isSuperAdmin ? true : hasPermission;
    if (!permissionResult)
      throw new MethodNotAllowedResponse({
        ar: 'غير مصرح لك',
        en: 'You have no permission',
      });
  }
}
