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
import { Account } from '../common/decorators/user.decorator';
import { BikersService } from './bikers.service';
import { UserAuthGuard } from '../auth/guards';
import { BikerProfileOwnerGuard } from './guard/bikerProfileOwner.guard';
import { IsAdminGuard } from '../admin/guard/isAdmin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBikerDTO } from './dto/createBiker.dto';
import { UpdateBikerDTO } from './dto/updateBiker.dto';

@Controller('bikers')
export class BikersController {
  constructor(private bikersService: BikersService) {}

  @Post('')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async createBikerController(
    @Account() account: any,
    @Body() createBikerDTO: CreateBikerDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
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
  @UseGuards(UserAuthGuard)
  async getByIdController(@Account() account: any) {
    return {
      success: true,
      data: await this.bikersService.getByIdOr404(account.id),
    };
  }

  @Get('/admin')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getAllBikersController() {
    return {
      success: true,
      data: await this.bikersService.getAll(),
    };
  }
  @Get(':bikerId')
  @UseGuards(UserAuthGuard)
  async getBikerProfileController(@Param('bikerId') bikerId: string) {
    return {
      success: true,
      data: await this.bikersService.getByIdOr404(bikerId),
    };
  }

  @Delete(':bikerId')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async deleteBikerController(@Param('bikerId') bikerId: string) {
    await this.bikersService.deleteBiker(bikerId);

    return {
      success: true,
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
