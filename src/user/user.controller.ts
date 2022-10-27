import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Account } from 'src/common/decorators/user.decorator';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UserAuthGuard } from '../auth/guards/userAuthentication.guard';
import {
  UserAuthorizedGuard,
  ProfileOwnerOrAuthClientGuard,
  ProfileOwnerGuard,
} from './guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserUpdateProfileDTO } from './dto';

@Controller('users')
export class UserController {
  constructor(
    private vehiclesService: VehiclesService,
    private userService: UserService,
  ) {}

  @Get('vehicles')
  @UseGuards(UserAuthGuard, UserAuthorizedGuard)
  async getAllUserVehicles(@Account() account: any) {
    return {
      success: true,
      data: await this.vehiclesService.getAll(account.id),
    };
  }
  @Put('')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  @UseInterceptors(FileInterceptor('image', { dest: 'uploads/' }))
  async updateProfileController(
    @Account() account: any,
    @Body() userUpdateProfileDTO: UserUpdateProfileDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const userProfile = await this.userService.update(
      account.id,
      userUpdateProfileDTO,
      image,
    );

    return {
      success: true,
      data: {
        ...userProfile,
      },
    };
  }

  @Delete('')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async deleteProfileController(@Account() account: any) {
    await this.userService.delete(account.id);
    return {
      success: true,
    };
  }

  @Get(':userId')
  @UseGuards(UserAuthGuard, ProfileOwnerOrAuthClientGuard)
  async getProfileController(@Param('userId') userId: string) {
    const userProfile = await this.userService.getUserByIdOr404(userId);

    return {
      success: true,
      data: { ...userProfile },
    };
  }
}
