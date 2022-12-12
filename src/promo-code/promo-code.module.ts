import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCodesController } from './controllers/promo-codes.controller';
import { PromoCodesService } from './services/promo-code.service';
import { PromoCodesRepository } from './repositories/promo-code.repository';
import { AppliedPromoCodesRepository } from './repositories/applied-promo-codes.repository';
import {
  appliedPromoCodeModelName,
  AppliedPromoCodeSchema,
} from './schemas/applied-promo-codes.schema';
import {
  promoCodeModelName,
  PromoCodeSchema,
} from './schemas/promo-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: promoCodeModelName, schema: PromoCodeSchema },
      { name: appliedPromoCodeModelName, schema: AppliedPromoCodeSchema },
    ]),
  ],
  controllers: [PromoCodesController],
  providers: [
    PromoCodesService,
    PromoCodesRepository,
    AppliedPromoCodesRepository,
  ],
  exports: [PromoCodesService],
})
export class PromoCodeModule {}
