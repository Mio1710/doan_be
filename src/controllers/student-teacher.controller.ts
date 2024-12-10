import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from 'src/dtos';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('student-teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('student')
export class StudentTeacherController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Get()
  async getListTeachers(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const options = { where: { khoa_id } };
    const data = await this.userService.getListss(options);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTeacher(@Body() user: CreateUserDTO, @Res() res) {
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getTeacherById(@Param() id: number, @Res() res) {
    const data = await this.userService.findOne(id);
    return this.responseUtils.success({ data }, res);
  }

  @Delete(':id')
  async deleteTeacher(@Param() id: number, @Res() res) {
    const data = await this.userService.delete(id);
    return this.responseUtils.success({ data }, res);
  }

  @Post(':id/update-role')
  async updateRole(
    @Param() id: number,
    @Body('data') role: string[],
    @Res() res,
  ) {
    const data = await this.userService.updateRole(id, role);
    return this.responseUtils.success({ data }, res);
  }
}
