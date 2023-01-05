import { IsIn, IsNotEmpty } from 'class-validator';
import { PromoCodeStatus } from '../schemas/promo-code.schema';

export class GetPromoCodesDTO {
  @IsNotEmpty()
  @IsIn([PromoCodeStatus.ACTIVE, PromoCodeStatus.EXPIRED])
  status: string;
}
