import { IsNotEmpty } from 'class-validator';
import { Plan } from '../schemas/plans.schema';
import { City } from '../../city/schemas/city.schema';

export class UpdatePlanCitiesDTO {
  @IsNotEmpty()
  plan: Plan;

  @IsNotEmpty()
  city: City;
}
