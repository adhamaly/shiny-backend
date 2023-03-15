import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateBikerDTO, UpdateBikerDTO } from '../dto';
import {
  Biker,
  BikerModel,
  BikerStatus,
  bikerModelName,
} from '../schemas/bikers.schema';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { BikerCrudValidator } from '../services/bikersCrud.validator';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import { NotFoundResponse } from '../../common/errors/NotFoundResponse';
import { adminModelName, Roles } from '../../admin/schemas/admin.schema';
import { cityModelName, City } from '../../city/schemas/city.schema';

@Injectable()
export class BikersRepository {
  populatedPaths = [
    { path: 'city', select: 'name', model: cityModelName },
    { path: 'createdBy', select: 'userName', model: adminModelName },
    { path: 'createdBy', select: 'userName', model: adminModelName },
  ];
  constructor(
    @InjectModel(bikerModelName) private readonly bikerModel: Model<BikerModel>,
    private bikerCrudValidator: BikerCrudValidator,
    private firebaseService: FirebaseService,
  ) {}

  async create(
    adminId: string,
    createBikerDTO: CreateBikerDTO,
    image: Express.Multer.File,
    hashedPassword: string,
  ) {
    if (!image)
      throw new MethodNotAllowedResponse({
        ar: 'قم برفع الصورة الشخصية',
        en: 'Upload personal image',
      });

    // Validate Input data Existence
    await this.bikerCrudValidator.createValidator(
      createBikerDTO.phone,
      createBikerDTO.nationalId,
      createBikerDTO.userName,
    );

    const createdBiker = await this.bikerModel.create({
      userName: createBikerDTO.userName,
      password: hashedPassword,
      phone: createBikerDTO.phone,
      city: createBikerDTO.city,
      nationalId: createBikerDTO.nationalId,
      createdBy: adminId,
    });

    // Upload Image for user
    const { fileLink, filePath } = await this.firebaseService.uploadImage(
      image,
    );

    createdBiker.imageLink = fileLink;
    createdBiker.imagePath = filePath;
    await createdBiker.save();
  }

  async findAll(role: string, cities: City[]) {
    //TODO: Add Pagination for bikers List

    return await this.bikerModel
      .find({
        isDeleted: false,
        ...(role === Roles.SuperAdmin ? {} : { city: { $in: cities } }),
      })
      .populate(this.populatedPaths)
      .exec();
  }

  async findAllWithStatus(status: BikerStatus, city: City) {
    return await this.bikerModel
      .find({
        isDeleted: false,
        status: status,
        city: city,
      })
      .exec();
  }

  async findByIdOr404(id: string) {
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .select('+fcmTokens')
      .populate(this.populatedPaths)
      .exec();

    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    return biker;
  }
  async findByIdWithPasswordOr404(id: string) {
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .select('+password')
      .exec();

    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    return biker;
  }

  async findByPhoneNumber(phone: string) {
    return await this.bikerModel
      .findOne({ phone: phone, isDeleted: false })
      .exec();
  }

  async findByUserNameOr404(userName: string) {
    const biker = await this.bikerModel
      .findOne({ userName: userName, isDeleted: false })
      .select('+password +fcmTokens')
      .exec();

    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    return biker;
  }

  async findBiker(id: string) {
    return await this.bikerModel.findById(id).select('+fcmTokens').exec();
  }

  async delete(id: string) {
    // TODO: CHECK HIS WALLET BEFORE DELETION
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .select('+fcmTokens')
      .exec();

    biker.isDeleted = true;
    biker.userName = '-d ' + biker.userName;
    biker.phone = '-d ' + biker.phone;
    biker.fcmTokens = [];
    biker.nationalId = '-d ' + biker.nationalId;

    await biker.save();
  }

  async updateBikerPassword(bikerId: string, hashedPassword: string) {
    await this.bikerModel
      .updateOne({ _id: bikerId }, { $set: { password: hashedPassword } })
      .exec();
  }

  async updateBikerPublicInfo(
    bikerId: string,
    userName: string,
    image: Express.Multer.File,
  ) {
    const biker = await this.findById(bikerId);
    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    if (await this.isUserNameExistForAnotherBiker(bikerId, userName))
      throw new MethodNotAllowedResponse({
        ar: 'رقم البطاقة القومي مسجل من قبل',
        en: 'National Id is already exist',
      });
    const updatedBiker = await this.bikerModel
      .findByIdAndUpdate(
        bikerId,
        {
          $set: {
            userName: userName,
          },
        },
        { new: true },
      )
      .exec();

    if (image) {
      if (updatedBiker.imagePath)
        await this.firebaseService.deleteFileFromStorage(
          updatedBiker.imagePath,
        );

      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      updatedBiker.imageLink = fileLink;
      updatedBiker.imagePath = filePath;
      await updatedBiker.save();
    }
  }

  async isUserNameExistForAnotherBiker(id: string, userName: string) {
    return await this.bikerModel
      .findOne({ _id: { $ne: id }, userName: userName, isDeleted: false })
      .exec();
  }

  async update(
    id: string,
    updateBikerDTO: UpdateBikerDTO,
    image: Express.Multer.File,
    adminId: string,
  ) {
    const biker = await this.findById(id);
    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    await this.bikerCrudValidator.updateBikerValidator(id, updateBikerDTO);

    const updatedBiker = await this.bikerModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            userName: updateBikerDTO.userName,
            phone: updateBikerDTO.phone,
            nationalId: updateBikerDTO.nationalId,
            city: updateBikerDTO.city,
            updatedBy: adminId,
          },
        },
        { new: true },
      )
      .exec();

    if (image) {
      if (updatedBiker.imagePath)
        await this.firebaseService.deleteFileFromStorage(
          updatedBiker.imagePath,
        );

      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      updatedBiker.imageLink = fileLink;
      updatedBiker.imagePath = filePath;
      await updatedBiker.save();
    }

    return updatedBiker;
  }

  async findById(id: string) {
    return await this.bikerModel.findOne({ _id: id, isDeleted: false }).exec();
  }
  async updateLocation(
    bikerId: string,
    location: {
      latitude: number;
      longitude: number;
      streetName: string;
      subAdministrativeArea: string;
    },
  ) {
    return await this.bikerModel
      .findByIdAndUpdate(
        bikerId,
        {
          $set: {
            latitude: location.latitude,
            longitude: location.longitude,
            streetName: location.streetName,
            subAdministrativeArea: location.subAdministrativeArea,
          },
        },
        { new: true },
      )
      .exec();
  }
}
