import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import {
  ServiceIcon,
  servicesIconModelName,
  ServicesIconsModel,
} from './schemas/services-icons.schema';
import { Model } from 'mongoose';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class ServicesIconsService {
  constructor(
    @InjectModel(servicesIconModelName)
    private readonly servicesIconsModel: Model<ServicesIconsModel>,
    private firebaseService: FirebaseService,
  ) {}

  async injectIcons() {
    // check numbers of files updloaded
    const countOfIconsUploaded = await this.getCount();
    if (countOfIconsUploaded) return;

    // Get Number of files in fileSystem
    const staticIcons = fs.readdirSync(`icons/`);

    let counter = staticIcons.length;
    // iterate and upload file
    while (counter) {
      // Upload File
      const { fileLink, filePath } = await this.firebaseService.uploadIcon(
        staticIcons[--counter],
      );

      // Save File link and path
      await this.servicesIconsModel.create({
        iconLink: fileLink,
        iconPath: filePath,
      });
    }
  }

  async getAll() {
    return await this.servicesIconsModel.find().exec();
  }

  async getCount() {
    return await this.servicesIconsModel.count().exec();
  }

  async getByIdOr404(id: string) {
    const icon = await this.servicesIconsModel.findById(id).exec();
    if (!icon)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الصورة',
        en: 'Icon not found',
      });

    return icon;
  }

  async isExistOr404(id: string) {
    const icon = await this.servicesIconsModel.findById(id).exec();
    if (!icon)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الصورة',
        en: 'Icon not found',
      });

    return true;
  }
}
