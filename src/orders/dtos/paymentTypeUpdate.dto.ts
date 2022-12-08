import { IsNotEmpty } from 'class-validator';
export class PaymentTypeUpdateDTO {
  @IsNotEmpty()
  order: string;

  @IsNotEmpty()
  paymentType: string;
}
