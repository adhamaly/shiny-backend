import { Injectable } from '@nestjs/common';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { AdminRepository } from './admin.repository';

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
    return await this.adminRepository.findById(id);
  }
}
