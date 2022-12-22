import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdminStatus } from '../schemas/admin.schema';
import { Transform } from 'class-transformer';

export class GetAdminsDTO {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt({ message: 'page must be an integer' })
  page: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsInt({ message: 'perPage must be an integer' })
  perPage: number;

  @IsOptional()
  @IsString()
  @IsIn([AdminStatus.ACTIVE, AdminStatus.SUSPENDED])
  status: string;
}
