import { ServiceIcon } from '../../services-icons/schemas/services-icons.schema';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAddOnsDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsMongoId()
  icon: ServiceIcon;
}
