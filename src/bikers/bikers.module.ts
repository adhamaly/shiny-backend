import { Module } from '@nestjs/common';
import { BikersService } from './bikers.service';
import { BikersController } from './bikers.controller';

@Module({
  providers: [BikersService],
  controllers: [BikersController],
})
export class BikersModule {}
