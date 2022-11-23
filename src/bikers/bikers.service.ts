import { Injectable } from '@nestjs/common';
import { BikersRepository } from './bikers.repository';
import { CreateBikerDTO } from './dto';
import { UpdateBikerDTO } from './dto/updateBiker.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class BikersService {
  constructor(
    private bikersRepository: BikersRepository,
    private adminService: AdminService,
  ) {}

  async createBiker(
    adminId: string,
    createBikerDTO: CreateBikerDTO,
    image: Express.Multer.File,
  ) {
    await this.adminService.CityPermissionForBikerCreation(
      adminId,
      createBikerDTO.city,
    );
    return await this.bikersRepository.create(adminId, createBikerDTO, image);
  }

  async getAll() {
    return await this.bikersRepository.findAll();
  }

  async getByIdOr404(id: string) {
    return await this.bikersRepository.findByIdOr404(id);
  }

  async deleteBiker(id: string) {
    await this.bikersRepository.delete(id);
  }

  async updateBiker(
    bikerId: string,
    adminId: string,
    updateBikerDTO: UpdateBikerDTO,
    image: Express.Multer.File,
  ) {
    await this.adminService.CityPermissionForBikerCreation(
      adminId,
      updateBikerDTO.city,
    );
    return await this.bikersRepository.update(
      bikerId,
      updateBikerDTO,
      image,
      adminId,
    );
  }
}
