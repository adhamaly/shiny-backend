import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { OrderStatus } from '../schemas/orders.schema';

export class GetOrdersByAdminDTO {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt({ message: 'page must be an integer' })
  page: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt({ message: 'perPage must be an integer' })
  perPage: number;

  @IsOptional()
  @IsArray()
  status: OrderStatus[];
}
