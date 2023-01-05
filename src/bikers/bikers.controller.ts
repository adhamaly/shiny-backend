import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { UpdatePasswordDTO } from './dto/updatePassword.dto';

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
    await this.bikersService.createBiker(account.id, createBikerDTO, image);

    return {
      success: true,
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

  @Delete('')
  @UseGuards(UserAuthGuard)
  async deleteBikerController(@Account() account: any) {
    await this.bikersService.deleteBiker(account.id);

    return {
      success: true,
    };
  }

  @Put('update-info')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async updateBikerPublicInfoController(
    @Account() account: any,
    @Body('userName') userName: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    await this.bikersService.updatePublicInfo(account.id, userName, image);
    return {
      success: true,
    };
  }

  @Patch('update-credentials')
  @UseGuards(UserAuthGuard)
  async updateBikerCredentialsController(
    @Account() account: any,
    @Body() updatePasswordDTO: UpdatePasswordDTO,
  ) {
    await this.bikersService.updateCredentials(account.id, updatePasswordDTO);
    return {
      success: true,
    };
  }

  @Get('/admin/all')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async getAllBikersController(@Account() account: any) {
    return {
      success: true,
      data: await this.bikersService.getAll(account.id, account.role),
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

  @Patch(':bikerId/suspend')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async suspendBikerController(@Param('bikerId') bikerId: string) {
    return {
      success: true,
      data: await this.bikersService.suspendBikerById(bikerId),
    };
  }

  @Patch(':bikerId/restore')
  @UseGuards(UserAuthGuard, IsAdminGuard)
  async restoreBikerController(@Param('bikerId') bikerId: string) {
    return {
      success: true,
      data: await this.bikersService.restoreBikerById(bikerId),
    };
  }
}
