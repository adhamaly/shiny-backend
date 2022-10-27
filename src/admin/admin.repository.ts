import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminModel } from './schemas/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateSubAdminDTO } from './dto/admin.createSubAdmin.dto';
import { MethodNotAllowedResponse } from 'src/common/errors';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminModel>,
  ) {}

  async createSubAdmin(createSubAdminDTO: CreateSubAdminDTO) {
    if (await this.userNameIsAlreadyExits(createSubAdminDTO.userName))
      throw new MethodNotAllowedResponse({
        ar: 'اسم المستخدم مسجل من قبل',
        en: 'User Name is already exist',
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
      isSuperAdmin: createSubAdminDTO.isSuperAdmin,
      password: hashedPassword,
    });

    return { ...createdAdmin.toObject(), password: undefined };
  }

  async findAdminByUserNameOr404(userName: string) {
    const admin = await this.adminModel
      .findOne({
        userName: userName,
      })
      .exec();

    if (!admin)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا المستخدم',
        en: 'User not found',
      });

    return admin.toObject();
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
    return admin.toObject();
  }
}
