import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { CreateUserDTO } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { FacultyService, UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('super-admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('super_admin')
export class SuperAdminController {
  constructor(
    private readonly userService: UserService,
    private facultyService: FacultyService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Post('super-teacher')
  async createSuperTeacher(@Body() user: CreateUserDTO, @Res() res) {
    user.roles = ['teacher', 'admin'];
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhautypes', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Get('faculty')
  async getFaculties(@Res() res) {
    const data = await this.facultyService.getFacultyWithAdmins();
    return this.responseUtils.success({ data }, res);
  }

  @Delete('super-teacher/:id')
  async deleteSuperTeacher(@Param() id: number, @Res() res) {
    console.log('id', id);

    const data = await this.userService.delete(id);
    return this.responseUtils.success({ data }, res);
  }
}
