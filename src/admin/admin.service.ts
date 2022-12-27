import { Injectable } from '@nestjs/common';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { AdminRepository } from './admin.repository';
import { City } from '../city/schemas/city.schema';
import { MethodNotAllowedResponse } from '../common/errors';
import { PaginationService } from '../common/services/pagination/pagination.service';
import { AdminStatus } from './schemas/admin.schema';
import { UpdateAdminDTO } from './dto/admin.updateAdmin.dto';

@Injectable()
export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private paginationService: PaginationService,
  ) {}

  async createSubAdmin(createSubAdminDTO: CreateSubAdminDTO) {
    await this.adminRepository.createSubAdmin(createSubAdminDTO);
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
    return await this.adminRepository.findByIdOr404Populated(id);
  }

  async getAll(status: string, page: number, perPage: number) {
    const { skip, limit } = this.paginationService.getSkipAndLimit(
      Number(page),
      Number(perPage),
    );

    const { admins, count } = await this.adminRepository.findAll(
      status,
      skip,
      limit,
    );

    return this.paginationService.paginate(
      admins,
      count,
      Number(page),
      Number(perPage),
    );
  }

  async suspendAdmin(adminId: string, reason: string) {
    const admin = await this.adminRepository.findByIdOr404(adminId);

    if (admin.status === AdminStatus.SUSPENDED)
      throw new MethodNotAllowedResponse({
        ar: 'حساب المشرف مغلق ',
        en: 'Admin account is already suspended',
      });

    admin.status = AdminStatus.SUSPENDED;
    admin.suspendReason = reason;
    await admin.save();
  }

  async restoreAdmin(adminId: string) {
    const admin = await this.adminRepository.findByIdOr404(adminId);

    if (admin.status === AdminStatus.ACTIVE)
      throw new MethodNotAllowedResponse({
        ar: 'حساب المشرف متاح ',
        en: 'Admin account is already active',
      });

    admin.status = AdminStatus.ACTIVE;
    admin.suspendReason = '';
    await admin.save();
  }

  async updateAdminById(adminId: string, updateAdminDTO: UpdateAdminDTO) {
    await this.adminRepository.update(adminId, {
      phone: updateAdminDTO.phone,
      nationalId: updateAdminDTO.nationalId,
      city: updateAdminDTO.city,
    });
  }

  async deleteAdminById(adminId: string) {
    await this.adminRepository.delete(adminId);
  }

  async CityPermissionForCreation(adminId: string, city: City) {
    const admin = await this.adminRepository.findByIdOr404(adminId);

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
    const admin = await this.adminRepository.findByIdOr404(adminId);

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
