import { Module } from '@nestjs/common';
import { PlansService } from './services/plans.service';

@Module({
  imports: [],
  providers: [PlansService],
  controllers: [],
  exports: [],
})
export class PlansModule {}
