import { Injectable } from '@nestjs/common';
import { BikersRepository } from '../repositories/bikers.repository';
import { CreateBikerDTO } from '../dto';
import { UpdateBikerDTO } from '../dto/updateBiker.dto';
import { AdminService } from '../../admin/admin.service';
import { UpdatePasswordDTO } from '../dto/updatePassword.dto';
import * as bcrypt from 'bcrypt';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { BikerStatus, BikerModel, Biker } from '../schemas/bikers.schema';
import { City } from '../../city/schemas/city.schema';
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
    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      createBikerDTO.password,
      Number(process.env.SALT_OF_ROUND),
    );

    await this.bikersRepository.create(
      adminId,
      createBikerDTO,
      image,
      hashedPassword,
    );
  }

  async getAll(adminId: string, role: string) {
    const admin = await this.adminService.getById(adminId);
    return await this.bikersRepository.findAll(role, admin.city);
  }

  async getByIdOr404(id: string) {
    return await this.bikersRepository.findByIdOr404(id);
  }

  async getById(id: string | Biker) {
    return await this.bikersRepository.findById(id);
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

  async resetPassword(bikerId: string, password: string) {
    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_OF_ROUND),
    );
    await this.bikersRepository.updateBikerPassword(bikerId, hashedPassword);
  }

  async updateCredentials(
    bikerId: string,
    updatePasswordDTO: UpdatePasswordDTO,
  ) {
    const biker = await this.bikersRepository.findByIdWithPasswordOr404(
      bikerId,
    );
    // Decrypt biker password and Compare
    const isMatch = await bcrypt.compare(
      updatePasswordDTO.oldPassword,
      biker.password,
    );
    if (!isMatch)
      throw new MethodNotAllowedResponse({
        ar: 'بيانات المستخدم غير صالحة',
        en: 'Invalid Biker credentials ',
      });

    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      updatePasswordDTO.newPassword,
      Number(process.env.SALT_OF_ROUND),
    );

    await this.bikersRepository.updateBikerPassword(bikerId, hashedPassword);
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

  async updateBikerStatus(bikerId: string, status: string) {
    const biker = await this.bikersRepository.findByIdOr404(bikerId);
    biker.status = status;
    await biker.save();
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
  async updateBikerSocketId(id: string, socketId: string) {
    const biker = await this.bikersRepository.findById(id);
    biker.socketId = socketId;
    await biker.save();
  }
  async getAllOnlineBikersForOrderLocation(city: City) {
    return await this.bikersRepository.findAllWithStatus(
      BikerStatus.ONLINE,
      city,
    );
  }
  async updateBikerLocation(
    bikerId: string,
    location: {
      latitude: number;
      longitude: number;
      streetName: string;
      subAdministrativeArea: string;
    },
  ) {
    return await this.bikersRepository.updateLocation(bikerId, location);
  }

  async removeInvalidFcmTokenForBiker(bikerId: string, fcmToken: string) {
    const biker = await this.bikersRepository.findBiker(bikerId);
    const validFcmTokens = biker.fcmTokens.filter((fcmTokenItem) => {
      return fcmTokenItem !== fcmToken;
    });
    console.log('valid fcmTokens :' + validFcmTokens);

    biker.fcmTokens = validFcmTokens;
    await biker.save();
  }

  async updateBikerLanguage(id: string, language: string) {
    const biker = await this.bikersRepository.findByIdOr404(id);

    biker.language = language;
    await biker.save();
  }
}
