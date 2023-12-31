import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import {
  promoCodeModelName,
  PromoCodesModel,
  PromoCodeStatus,
} from '../schemas/promo-code.schema';

@Injectable()
export class PromoCodesRepository {
  constructor(
    @InjectModel(promoCodeModelName)
    private readonly promoCodesModel: Model<PromoCodesModel>,
  ) {}

  async create(code: string, discountPercentage: number, expiryDate: Date) {
    if (await this.findOneByCode(code))
      throw new MethodNotAllowedResponse({
        ar: 'كود مسجل من قبل',
        en: 'Promo Code is Exist',
      });

    await this.promoCodesModel.create({
      code: code,
      discountPercentage: discountPercentage,
      expiryDate: expiryDate,
    });
  }

  async findOneByCode(code: string) {
    const isCodeExist = await this.promoCodesModel
      .findOne({
        code: code,
        status: PromoCodeStatus.ACTIVE,
      })
      .exec();

    return isCodeExist;
  }

  async findOneById(promoCodeId: string) {
    return await this.promoCodesModel.findById(promoCodeId).exec();
  }

  async findAllForUser(status: string, userId: string) {
    if (status === 'USED')
      return await this.appliedPromoCodesQueryForUser(userId);

    if (status === PromoCodeStatus.ACTIVE)
      return await this.findActivePromoCodes(userId);

    return await this.promoCodesModel
      .find({
        status: PromoCodeStatus.EXPIRED,
      })
      .exec();
  }

  async findAll(filter: any) {
    return await this.promoCodesModel
      .find({
        ...filter,
      })
      .exec();
  }

  async update(filter: any, updatedData: any) {
    await this.promoCodesModel
      .updateMany(
        {
          ...filter,
        },
        { $set: updatedData },
      )
      .exec();
  }

  async appliedPromoCodesQueryForUser(userId: string) {
    const res = await this.promoCodesModel
      .aggregate([
        {
          $lookup: {
            from: 'applied-promo-codes',
            let: { promoCodeId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$promoCodeId', '$promoCode'] } } },
              {
                $lookup: {
                  from: 'users',
                  let: { userId: '$user' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$$userId', '$_id'] },
                            {
                              $eq: [
                                '$$userId',
                                new mongoose.Types.ObjectId(userId),
                              ],
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'user',
                },
              },
              {
                $project: { _id: 0, promoCode: 0, createdAt: 0, updatedAt: 0 },
              },
              { $unwind: '$user' },
            ],
            as: 'user_applied',
          },
        },
      ])
      .exec();

    return this.appliedPromoCodesFormater(res);
  }

  async findActivePromoCodes(userId: string) {
    const res = await this.promoCodesModel
      .aggregate([
        {
          $match: { status: PromoCodeStatus.ACTIVE },
        },
        {
          $lookup: {
            from: 'applied-promo-codes',
            let: { promoCodeId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$promoCodeId', '$promoCode'] } } },
              {
                $lookup: {
                  from: 'users',
                  let: { userId: '$user' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$$userId', '$_id'] },
                            {
                              $eq: [
                                '$$userId',
                                new mongoose.Types.ObjectId(userId),
                              ],
                            },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'user',
                },
              },
              {
                $project: { _id: 0, promoCode: 0, createdAt: 0, updatedAt: 0 },
              },
              { $unwind: '$user' },
            ],
            as: 'applied',
          },
        },
      ])
      .exec();

    const filtered = res.filter((promoCode: any) => !promoCode.applied.length);

    filtered.forEach((promoCode) => {
      promoCode.applied = undefined;
    });
    return filtered;
  }

  appliedPromoCodesFormater(promoCodes: any[]) {
    const filtered = promoCodes.filter(
      (promoCode: any) => promoCode.user_applied.length >= 1,
    );

    filtered.forEach((promoCode) => {
      promoCode.user_applied = undefined;
    });
    return filtered;
  }
}
