import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWashingServiceDTO } from '../dtos/createWashingService.dto';
import {
  WashingService,
  WashingServicesModel,
} from '../schemas/washing-services.schema';

import * as fs from 'fs';
import { NotFoundResponse } from 'src/common/errors';

@Injectable()
export class WashingServicesRepository {
  constructor(
    @InjectModel(WashingService.name)
    private readonly washingServicesModel: Model<WashingServicesModel>,
  ) {}

  async create(createWashingServiceDTO: CreateWashingServiceDTO) {
    // Check ImagePath Exist

    if (
      !fs.existsSync(`${process.cwd()}/icons/${createWashingServiceDTO.icon}`)
    )
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه الايقونة',
        en: 'icon  not found',
      });

    // Create
    await this.washingServicesModel.create({
      name: createWashingServiceDTO.name,
      description: createWashingServiceDTO.description,
      duration: createWashingServiceDTO.duration,
      durationUnit: createWashingServiceDTO.durationUnit,
      price: createWashingServiceDTO.price,
      pointsToPay: createWashingServiceDTO.pointsToPay,
      iconPath: `${process.cwd()}/icons/${createWashingServiceDTO.icon}`,
    });
  }
}
