import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { IsVehicleOwner } from './guard';

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

  @Get(':vehicleId')
  @UseGuards(UserAuthGuard)
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
