import { Module } from '@nestjs/common';
import { PlansService } from './services/plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlansSchema } from './schemas/plans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlansSchema }]),
  ],
  providers: [PlansService],
  controllers: [],
  exports: [],
})
export class PlansModule {}
