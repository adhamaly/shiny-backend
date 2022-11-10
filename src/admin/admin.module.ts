import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { Admin, adminModelName, AdminSchema } from './schemas/admin.schema';
import { BikersModule } from '../bikers/bikers.module';
import { AdminBikerController } from './controllers/adminBikers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: adminModelName, schema: AdminSchema }]),
    BikersModule,
  ],
  controllers: [AdminController, AdminBikerController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
