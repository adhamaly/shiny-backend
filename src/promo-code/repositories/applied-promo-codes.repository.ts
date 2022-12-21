import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MethodNotAllowedResponse } from '../../common/errors/MethodNotAllowedResponse';
import { PromoCode, PromoCodeStatus } from '../schemas/promo-code.schema';
import { User } from '../../user/schemas/user.schema';
import {
  appliedPromoCodeModelName,
  AppliedPromoCodeModel,
} from '../schemas/applied-promo-codes.schema';

@Injectable()
export class AppliedPromoCodesRepository {
  constructor(
    @InjectModel(appliedPromoCodeModelName)
    private readonly appliedPromoCodeModel: Model<AppliedPromoCodeModel>,
  ) {}

  async applyPromoCode(user: User, promoCode: PromoCode) {
    await this.isValidPromoCode(user, promoCode);
    await this.appliedPromoCodeModel.create({
      user: user,
      promoCode: promoCode,
    });
  }
  async isValidPromoCode(user: User, promoCode: PromoCode) {
    const isExpired =
      promoCode.status === PromoCodeStatus.EXPIRED ? true : false;

    if (isExpired)
      throw new MethodNotAllowedResponse({
        ar: 'برومو كود غير متاح',
        en: 'Promo Code is Not Available',
      });
  }
}
