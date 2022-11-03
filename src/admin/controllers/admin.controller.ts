import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateSubAdminDTO } from '../dto/admin.createSubAdmin.dto';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { SuperAdminGuard } from 'src/auth/guards';
import { IsAdminGuard } from '../guard';
import { BikersService } from '../../bikers/bikers.service';

@Controller('admins')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private bikersService: BikersService,
  ) {}

  @Post()
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async createSubAdminController(@Body() createSubAdminDTO: CreateSubAdminDTO) {
    return {
      success: true,
      data: { ...(await this.adminService.createSubAdmin(createSubAdminDTO)) },
    };
  }
}
