import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateBikerDTO, UpdateBikerDTO } from './dto';
import { Biker, BikerModel, bikerModelName } from './schemas/bikers.schema';
import { MethodNotAllowedResponse } from '../common/errors/MethodNotAllowedResponse';
import { BikerCrudValidator } from './bikersCrud.validator';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';
import { adminModelName } from '../admin/schemas/admin.schema';
import { cityModelName } from '../city/schemas/city.schema';

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
    );

    // hash password using bycrpt
    const hashedPassword = await bcrypt.hash(
      createBikerDTO.password,
      Number(process.env.SALT_OF_ROUND),
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

    createdBiker.password = undefined;
    return createdBiker;
  }

  async findAll() {
    //TODO: Add Pagination for bikers List

    return await this.bikerModel
      .find({ isDeleted: false })
      .populate(this.populatedPaths)
      .exec();
  }

  async findByIdOr404(id: string) {
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .populate(this.populatedPaths)
      .exec();

    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    return biker;
  }

  async delete(id: string) {
    // TODO: CHECK HIS WALLET BEFORE DELETION
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    biker.isDeleted = true;
    biker.phone = '-d ' + biker.phone;
    biker.fcmTokens = [];
    biker.nationalId = '-d ' + biker.nationalId;

    await biker.save();
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
}
