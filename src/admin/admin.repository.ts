import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminModel, adminModelName } from './schemas/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { MethodNotAllowedResponse } from '../common/errors/MethodNotAllowedResponse';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(adminModelName) private readonly adminModel: Model<AdminModel>,
  ) {}

  async createSubAdmin(createSubAdminDTO: CreateSubAdminDTO) {
    if (await this.userNameIsAlreadyExits(createSubAdminDTO.userName))
      throw new MethodNotAllowedResponse({
        ar: 'اسم المستخدم مسجل من قبل',
        en: 'User Name is already exist',
      });

    if (await this.phoneIsAlreadyExist(createSubAdminDTO.phone))
      throw new MethodNotAllowedResponse({
        ar: 'الرقم مسجل من قبل',
        en: 'Phone is already exist',
      });

    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      createSubAdminDTO.password,
      Number(process.env.SALT_OF_ROUND),
    );

    const createdAdmin = await this.adminModel.create({
      userName: createSubAdminDTO.userName,
      phone: createSubAdminDTO.phone,
      city: createSubAdminDTO.city,
      password: hashedPassword,
    });

    createdAdmin.password = undefined;

    return createdAdmin;
  }

  async findAdminByUserNameOr404(userName: string) {
    const admin = await this.adminModel
      .findOne({
        userName: userName,
      })
      .select('+password')
      .exec();

    if (!admin)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا المستخدم',
        en: 'User not found',
      });

    return admin;
  }

  async userNameIsAlreadyExits(userName: string) {
    const isExist = await this.adminModel
      .findOne({
        userName: userName,
      })
      .exec();

    return isExist ? true : false;
  }

  async injectSuperAdmin() {
    const checkIfSuperIsExist = await this.adminModel
      .findOne({
        isSuperAdmin: true,
      })
      .exec();

    if (checkIfSuperIsExist) return;

    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      '12345678',
      Number(process.env.SALT_OF_ROUND),
    );

    await this.adminModel.create({
      userName: 'super admin',
      isSuperAdmin: true,
      password: hashedPassword,
    });
  }

  async findById(id: string) {
    const admin = await this.adminModel.findById(id).exec();
    return admin;
  }

  async findByIdOr404(id: string) {
    const admin = await this.adminModel.findById(id).exec();
    if (!admin)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا المشرف',
        en: 'Admin Account Not Found',
      });
    return admin;
  }

  async phoneIsAlreadyExist(phone: string) {
    const adminWithPhoneNumber = await this.adminModel
      .findOne({
        phone: phone,
      })
      .exec();

    return adminWithPhoneNumber ? true : false;
  }
}
