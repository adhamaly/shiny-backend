import { Module } from '@nestjs/common';
import { PlansService } from './services/plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlansSchema } from './schemas/plans.schema';
import { PlansController } from './controllers/plans.controller';
import { PlansRepository } from './repositories/plans.repoistory';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlansSchema }]),
  ],
  providers: [PlansService, PlansRepository],
  controllers: [PlansController],
  exports: [],
})
export class PlansModule {}
