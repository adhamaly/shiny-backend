import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Account } from '../../common/decorators/user.decorator';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import {
  UserAuthorizedGuard,
  ProfileOwnerOrAuthClientGuard,
  ProfileOwnerGuard,
} from '../guard';
import { UserService } from '../user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UpdateUserLocation,
  UserUpdateProfileDTO,
  UpdatePhoneNumberDTO,
} from '../dto';

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
        ...userProfile.toObject(),
        fcmTokens: undefined,
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

  @Get('')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async getProfileController(@Account() account: any) {
    const profile = await this.userService.getUserByIdOr404(account.id);
    return {
      success: true,
      data: {
        ...profile,
        fcmTokens: undefined,
      },
    };
  }

  @Patch('phone-number')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async updatePhoneNumberController(
    @Account() account: any,
    @Body() updatePhoneNumberDTO: UpdatePhoneNumberDTO,
  ) {
    const userProfile = await this.userService.updatePhoneNumber(
      account.id,
      updatePhoneNumberDTO,
    );
    return {
      success: true,
      data: {
        ...userProfile.toObject(),
        fcmTokens: undefined,
      },
    };
  }
  @Patch('user-location')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async updateUserLocationController(
    @Account() account: any,
    @Body() updateUserLocation: UpdateUserLocation,
  ) {
    return {
      success: true,
      message: await this.userService.updateUserLocation(
        account.id,
        updateUserLocation,
      ),
    };
  }
  @Patch('user-language')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async updateUserLanguageController(
    @Account() account: any,
    @Body('language') language: string,
  ) {
    return {
      success: true,
      data: await this.userService.updateUserLanguage(account.id, language),
    };
  }

  @Patch('notification-permission')
  @UseGuards(UserAuthGuard, ProfileOwnerGuard)
  async updateNotificationPermissions(
    @Account() account: any,
    @Body('allow') allow: string,
  ) {
    return {
      success: true,
      data: await this.userService.updateUserNotificationPermission(
        account.id,
        allow,
      ),
    };
  }
}
