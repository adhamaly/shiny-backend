import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import {
  ServiceIcon,
  ServicesIconsModel,
} from './schemas/services-icons.schema';
import { Model } from 'mongoose';

@Injectable()
export class ServicesIconsService {
  constructor(
    @InjectModel(ServiceIcon.name)
    private readonly servicesIconsModel: Model<ServicesIconsModel>,
    private firebaseService: FirebaseService,
  ) {}

  async injectIcons() {
    // check numbers of files updloaded
    const countOfIconsUploaded = await this.getCount();
    if (countOfIconsUploaded) return;

    // Get Number of files in fileSystem
    const staticIcons = fs.readdirSync(`${process.cwd()}/icons`);

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
}
