import { Injectable } from '@nestjs/common';
import { PromoCodesRepository } from '../repositories/promo-code.repository';
import { CreatePromoCodeDTO } from '../dtos/createPromoCode.dto';
import { AppliedPromoCodesRepository } from '../repositories/applied-promo-codes.repository';
import { User } from '../../user/schemas/user.schema';
import { PromoCode, PromoCodeStatus } from '../schemas/promo-code.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class PromoCodesService {
  constructor(
    private promoCodesRepository: PromoCodesRepository,
    private appliedPromoCodesRepository: AppliedPromoCodesRepository,
    private notificationService: NotificationsService,
  ) {}

  async createPromoCode(createPromoCodeDTO: CreatePromoCodeDTO) {
    const expiryDate = this.calculateExpiryDate(createPromoCodeDTO.duration);
    await this.promoCodesRepository.create(
      createPromoCodeDTO.code,
      createPromoCodeDTO.discountPercentage,
      expiryDate,
    );
    console.log('Heeeree ...');

    await this.notificationService.sendNewPromoCodeCreatedNotification(
      createPromoCodeDTO.code,
      createPromoCodeDTO.discountPercentage,
    );
  }

  async getAllForUser(status: string, userId: string) {
    return await this.promoCodesRepository.findAllForUser(status, userId);
  }

  async getAllForAdmin(status: string) {
    return await this.promoCodesRepository.findAll({ status: status });
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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
