import { Injectable } from '@nestjs/common';
import { PromoCodesRepository } from '../repositories/promo-code.repository';
import { CreatePromoCodeDTO } from '../dtos/createPromoCode.dto';
import { AppliedPromoCodesRepository } from '../repositories/applied-promo-codes.repository';
import { User } from '../../user/schemas/user.schema';
import { PromoCode } from '../schemas/promo-code.schema';

@Injectable()
export class PromoCodesService {
  constructor(
    private promoCodesRepository: PromoCodesRepository,
    private appliedPromoCodesRepository: AppliedPromoCodesRepository,
  ) {}

  async createPromoCode(createPromoCodeDTO: CreatePromoCodeDTO) {
    const expiryDate = this.calculateExpiryDate(createPromoCodeDTO.duration);
    await this.promoCodesRepository.create(
      createPromoCodeDTO.code,
      createPromoCodeDTO.discountPercentage,
      expiryDate,
    );
  }

  async getAllForUser(status: string) {
    return await this.promoCodesRepository.findAllForUser(status);
  }

  calculateExpiryDate(duration: number) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);
    return expiryDate;
  }

  async getByCode(code: string) {
    return await this.promoCodesRepository.findOneByCode(code);
  }

  async apply(user: User, promoCode: PromoCode) {
    await this.appliedPromoCodesRepository.applyPromoCode(user, promoCode);
  }
}
