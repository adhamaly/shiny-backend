import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateSubAdminDTO } from '../dto/admin.createSubAdmin.dto';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { SuperAdminGuard } from '../../auth/guards';

@Controller('admins')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post()
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async createSubAdminController(@Body() createSubAdminDTO: CreateSubAdminDTO) {
    return {
      success: true,
      data: await this.adminService.createSubAdmin(createSubAdminDTO),
    };
  }
}
