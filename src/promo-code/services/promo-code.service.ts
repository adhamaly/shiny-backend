import { Injectable } from '@nestjs/common';
import { PromoCodesRepository } from '../repositories/promo-code.repository';
import { CreatePromoCodeDTO } from '../dtos/createPromoCode.dto';
import { AppliedPromoCodesRepository } from '../repositories/applied-promo-codes.repository';
import { User } from '../../user/schemas/user.schema';
import { PromoCode, PromoCodeStatus } from '../schemas/promo-code.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkPromoCodeExpiryDateReached() {
    console.log(`PromoCode Expiry Date Reached Started at ${new Date()}`);
    const today = new Date();

    // Get the PromoCodes that today or befor is its expairy date
    const expairedPromoCodes = await this.promoCodesRepository.findAll({
      expiryDate: { $lte: today },
      status: PromoCodeStatus.ACTIVE,
    });

    console.log(
      `Number of PromoCodes to be Exipred at ${new Date()} is ${
        expairedPromoCodes.length
      }`,
    );

    await this.promoCodesRepository.update(
      {
        _id: {
          $in: expairedPromoCodes.map(
            (expiredPromoCode) => expiredPromoCode._id,
          ),
        },
      },
      { status: PromoCodeStatus.EXPIRED },
    );
  }
}
