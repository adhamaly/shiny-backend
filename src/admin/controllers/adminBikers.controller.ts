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
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { IsAdminGuard } from '../guard';
import { BikersService } from '../../bikers/bikers.service';
import { Account } from 'src/common/decorators/user.decorator';
import { UpdateBikerDTO } from '../../bikers/dto/updateBiker.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBikerDTO } from '../../bikers/dto/createBiker.dto';

@Controller('admins/bikers')
export class AdminBikerController {
  constructor(private bikersService: BikersService) {}

  @Post('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async createBikerController(
    @Account() account: any,
    @Body() createBikerDTO: CreateBikerDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    //TODO:CHECK IF SUPERADMIN OR SAME CITY ADMIN
    const createdBiker = await this.bikersService.createBiker(
      account.id,
      createBikerDTO,
      image,
    );

    return {
      success: true,
      data: createdBiker,
    };
  }

  @Get('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getAllBikersController() {
    return {
      success: true,
      data: await this.bikersService.getAll(),
    };
  }
  @Get(':bikerId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getBikerProfileController(@Param('bikerId') bikerId: string) {
    return {
      success: true,
      data: await this.bikersService.getByIdOr404(bikerId),
    };
  }

  @Delete(':bikerId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async deleteBikerController(@Param('bikerId') bikerId: string) {
    return {
      success: true,
      data: await this.bikersService.deleteBiker(bikerId),
    };
  }

  @Put(':bikerId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async updateBikerController(
    @Param('bikerId') bikerId: string,
    @Account() account: any,
    @Body() updateBikerDTO: UpdateBikerDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return {
      success: true,
      data: await this.bikersService.updateBiker(
        bikerId,
        account.id,
        updateBikerDTO,
        image,
      ),
    };
  }
}
