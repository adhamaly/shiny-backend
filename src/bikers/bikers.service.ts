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
    await this.adminService.CityPermissionForCreation(
      adminId,
      createBikerDTO.city,
    );
    await this.bikersRepository.create(adminId, createBikerDTO, image);
  }

  async getAll() {
    return await this.bikersRepository.findAll();
  }

  async getByIdOr404(id: string) {
    return await this.bikersRepository.findByIdOr404(id);
  }

  async getBikerByUserNameOr404(userName: string) {
    return await this.bikersRepository.findByUserNameOr404(userName);
  }

  async deleteBiker(id: string) {
    await this.bikersRepository.delete(id);
  }

  async checkPhoneNumber(phone: string) {
    return await this.bikersRepository.findByPhoneNumber(phone);
  }

  async updatePassword(bikerId: string, password: string) {
    await this.bikersRepository.updateBikerPassword(bikerId, password);
  }

  async updatePublicInfo(
    bikerId: string,
    userName: string,
    image: Express.Multer.File,
  ) {
    await this.bikersRepository.updateBikerPublicInfo(bikerId, userName, image);
  }
  async updateBiker(
    bikerId: string,
    adminId: string,
    updateBikerDTO: UpdateBikerDTO,
    image: Express.Multer.File,
  ) {
    await this.adminService.CityPermissionForCreation(
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

  async suspendBikerById(bikerId: string) {
    const biker = await this.bikersRepository.findByIdOr404(bikerId);
    biker.status = 'SUSPENDED';
    await biker.save();
  }
  async restoreBikerById(bikerId: string) {
    const biker = await this.bikersRepository.findByIdOr404(bikerId);
    biker.status = 'ACTIVE';
    await biker.save();
  }
}
