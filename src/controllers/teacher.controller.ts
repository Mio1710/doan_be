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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/role.decorator';
import { CreateUserDTO, UpdateTeacherDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class TeacherController {
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
    const data = await this.userService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTeacher(@Body() user: CreateUserDTO, @Res() res) {
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Put()
  async updateTeacher(@Body() user: UpdateTeacherDto, @Res() res) {
    const { matkhau, ...data } = await this.userService.update(user);
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

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() teachers, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;

    if (!khoa_id) {
      return this.responseUtils.failed(
        {
          message: 'Bạn không có quyền thực hiện chức năng này',
        },
        res,
      );
    }
    const data = await this.userService.import(teachers, khoa_id);
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
