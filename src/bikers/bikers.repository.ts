import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateBikerDTO, UpdateBikerDTO } from './dto';
import { Biker, BikerModel } from './schemas/bikers.schema';
import { MethodNotAllowedResponse } from '../common/errors/MethodNotAllowedResponse';
import { BikerCrudValidator } from './bikersCrud.validator';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class BikersRepository {
  constructor(
    @InjectModel(Biker.name) private readonly bikerModel: Model<BikerModel>,
    private bikerCrudValidator: BikerCrudValidator,
    private firebaseService: FirebaseService,
  ) {}

  async create(createBikerDTO: CreateBikerDTO, image: Express.Multer.File) {
    if (!image)
      throw new MethodNotAllowedResponse({
        ar: 'قم برفع الصورة الشخصية',
        en: 'Upload personal image',
      });

    // Validate Input data Existance
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
      gender: createBikerDTO.gender,
      city: createBikerDTO.city,
      nationalId: createBikerDTO.nationalId,
    });

    // Upload Image for user
    const { fileLink, filePath } = await this.firebaseService.uploadImage(
      image,
    );

    createdBiker.imageLink = fileLink;
    createdBiker.imagePath = filePath;
    await createdBiker.save();

    return createdBiker.toObject();
  }

  async findAll() {
    //TODO: Add Pagination for bikers List

    return await this.bikerModel.find({ isDeleted: false }).exec();
  }

  async findByIdOr404(id: string) {
    const biker = await this.bikerModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    return biker.toObject();
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
  ) {
    const biker = await this.findById(id);
    if (!biker)
      throw new NotFoundResponse({
        ar: 'لا يوجد هذا السائق',
        en: 'Biker not found',
      });

    await this.bikerCrudValidator.updateBikerValidator(id, updateBikerDTO);

    biker.userName = updateBikerDTO.userName;
    biker.phone = updateBikerDTO.phone;
    biker.gender = updateBikerDTO.gender;
    biker.nationalId = updateBikerDTO.nationalId;
    biker.city = updateBikerDTO.city;

    await biker.save();

    if (image) {
      if (biker.imagePath)
        await this.firebaseService.deleteFileFromStorage(biker.imagePath);

      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      biker.imageLink = fileLink;
      biker.imagePath = filePath;
      await biker.save();
    }

    return biker.toObject();
  }

  async findById(id: string) {
    return await this.bikerModel.findOne({ _id: id, isDeleted: false }).exec();
  }
}
