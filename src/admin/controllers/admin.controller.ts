import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateSubAdminDTO } from '../dto/admin.createSubAdmin.dto';
import { UserAuthGuard } from '../../auth/guards/userAuthentication.guard';
import { SuperAdminGuard } from '../../auth/guards';
import { GetAdminsDTO } from '../dto';
import { Account } from 'src/common/decorators/user.decorator';
import { City } from '../../city/schemas/city.schema';
import { UpdateAdminDTO } from '../dto/admin.updateAdmin.dto';

@Controller('admins')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post()
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async createSubAdminController(@Body() createSubAdminDTO: CreateSubAdminDTO) {
    await this.adminService.createSubAdmin(createSubAdminDTO);
    return {
      success: true,
    };
  }

  @Get()
  @UseGuards(UserAuthGuard)
  async getAdminByIdController(@Account() account: any) {
    return {
      success: true,
      data: await this.adminService.getByIdOr404(account.id),
    };
  }

  @Get('all')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async getAllAdminsController(@Query() getAdminsDTO: GetAdminsDTO) {
    const result = await this.adminService.getAll(
      getAdminsDTO.status,
      getAdminsDTO.page,
      getAdminsDTO.perPage,
    );
    return {
      success: true,
      page: result.paginationData.page,
      perPage: result.paginationData.perPage,
      totalItems: result.paginationData.totalItems,
      totalPages: result.paginationData.totalPages,
      data: result.dataList,
    };
  }

  @Delete(':adminId')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async deleteAdminByIdController(@Param('adminId') adminId: string) {
    await this.adminService.deleteAdminById(adminId);
    return {
      success: true,
    };
  }

  @Get(':adminId/details')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async getAdminByController(@Param('adminId') adminId: string) {
    return {
      success: true,
      data: await this.adminService.getByIdOr404(adminId),
    };
  }

  @Patch(':adminId/suspend')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async suspendAdminController(
    @Param('adminId') adminId: string,
    @Body('reason') reason: string,
  ) {
    await this.adminService.suspendAdmin(adminId, reason);
    return {
      success: true,
    };
  }

  @Patch(':adminId/restore')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async restoreAdminController(@Param('adminId') adminId: string) {
    await this.adminService.restoreAdmin(adminId);
    return {
      success: true,
    };
  }

  @Patch(':adminId/update-info')
  @UseGuards(UserAuthGuard, SuperAdminGuard)
  async updateAdminCities(
    @Param('adminId') adminId: string,
    @Body() updateAdminDTO: UpdateAdminDTO,
  ) {
    await this.adminService.updateAdminById(adminId, updateAdminDTO);
    return {
      success: true,
    };
  }
}
