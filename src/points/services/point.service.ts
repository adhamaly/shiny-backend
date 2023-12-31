import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointsModel } from '../schemas/points.schema';
import { MethodNotAllowedResponse, NotFoundResponse } from 'src/common/errors';

@Injectable()
export class PointService {
  constructor(
    @InjectModel('points') private readonly pointsModel: Model<PointsModel>,
  ) {}

  async createPointsPercentages(
    totalPayPercentage: number,
    exchangePercentage: number,
    redeemLimit: number,
  ) {
    const pointSystem = await this.pointsModel.findOne();
    if (pointSystem)
      throw new MethodNotAllowedResponse({
        en: 'Poinst System Is Already Implemented',
        ar: 'نظام النقط تم تفعيله',
      });

    return await this.pointsModel.create({
      totalPayPercentage,
      exchangePercentage,
      redeemLimit,
    });
  }

  async updatePointsPercentage(
    totalPayPercentage: number,
    exchangePercentage: number,
    redeemLimit: number,
  ) {
    const pointSystem = await this.pointsModel.findOne();
    if (!pointSystem)
      throw new NotFoundResponse({
        en: 'Points System Not Exist, Please Implement Points System',
        ar: 'نظام النقاط غير مغعل حاليا',
      });

    pointSystem.exchangePercentage = exchangePercentage;
    pointSystem.totalPayPercentage = totalPayPercentage;
    pointSystem.redeemLimit = redeemLimit;

    await pointSystem.save();
  }

  async getPointsSystem() {
    return await this.pointsModel.findOne();
  }

  async calculateEarningPoints(totalPay: number) {
    const pointSystem = await this.pointsModel.findOne();

    const numberOfPoints = (pointSystem.totalPayPercentage / 100) * totalPay;
    return Number(numberOfPoints.toFixed(0));
  }

  async calculatePointsExchange(numberOfPoints: number) {
    const pointSystem = await this.pointsModel.findOne();

    return (pointSystem.exchangePercentage / 100) * numberOfPoints;
  }
}
