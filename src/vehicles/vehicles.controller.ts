import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDTO } from './dto/createVehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Account } from 'src/common/decorators/user.decorator';
import { UserAuthGuard } from 'src/auth/guards';
import { UserAuthorizedGuard } from 'src/user/guard';
import { IsVehicleOwner, IsVehicleOwnerOrAdmin } from './guard';
import { IsAdminGuard } from 'src/admin/guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post('')
  @UseGuards(UserAuthGuard, UserAuthorizedGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async createVehicleController(
    @Account() account: any,
    @Body() createVehicleDTO: CreateVehicleDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const result = await this.vehiclesService.createVehicle(
      account.id,
      createVehicleDTO,
      image,
    );

    return {
      success: true,
      data: {
        ...result,
      },
    };
  }
  @Get('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getAllController(@Query('userId') userId: string) {
    const vehicles = await this.vehiclesService.getAll(userId);

    return {
      success: true,
      data: vehicles,
    };
  }
  @Get('cars-model')
  @UseGuards(UserAuthGuard, UserAuthorizedGuard)
  getCarModels() {
    const cars = [
      'Audi',
      'Chevrolet',
      'Cadillac',
      'Acura',
      'BMW',
      'Chrysler',
      'Ford',
      'Buick',
      'INFINITI',
      'GMC',
      'Honda',
      'Hyundai',
      'Jeep',
      'Genesis',
      'Dodge',
      'Jaguar',
      'Kia',
      'Land Rover',
      'Lexus',
      'Mercedes-Benz',
      'Mitsubishi',
      'Lincoln',
      'MAZDA',
      'Nissan',
      'MINI',
      'Porsche',
      'Ram',
      'Subaru',
      'Toyota',
      'Volkswagen',
      'Volvo',
      'Alfa Romeo',
      'FIAT',
      'Freightliner',
      'Maserati',
      'Tesla',
      'Aston Martin',
      'Bentley',
      'Ferrari',
      'Lamborghini',
      'Lotus',
      'McLaren',
      'Rolls-Royce',
      'smart',
      'Scion',
      'SRT',
      'Suzuki',
      'Fisker',
      'Maybach',
      'Mercury',
      'Saab',
      'HUMMER',
      'Pontiac',
      'Saturn',
      'Isuzu',
      'Panoz',
      'Oldsmobile',
      'Daewoo',
      'Plymouth',
      'Eagle',
      'Geo',
      'Daihatsu',
      'Speranza',
    ];

    return {
      success: true,
      data: cars,
    };
  }

  @Get(':vehicleId')
  @UseGuards(UserAuthGuard, IsVehicleOwnerOrAdmin)
  async getByIdController(@Param('vehicleId') vehicleId: string) {
    const vehicle = await this.vehiclesService.getByIdOr404(vehicleId);

    return {
      success: true,
      data: { ...vehicle },
    };
  }

  @Delete(':vehicleId')
  @UseGuards(UserAuthGuard, IsVehicleOwner)
  async deleteController(@Param('vehicleId') vehicleId: string) {
    await this.vehiclesService.delete(vehicleId);

    return {
      success: true,
    };
  }

  @Put(':vehicleId')
  @UseGuards(UserAuthGuard, IsVehicleOwner)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async updateController(
    @Param('vehicleId') vehicleId: string,
    @Body() createVehicleDTO: CreateVehicleDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const vehicle = await this.vehiclesService.update(
      vehicleId,
      createVehicleDTO,
      image,
    );

    return {
      success: true,
      data: {
        ...vehicle,
      },
    };
  }
}
