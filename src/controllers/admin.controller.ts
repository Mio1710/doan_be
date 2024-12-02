import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import {
  CreateStudentDto,
  CreateUserDTO,
  StudentInfoDto,
  UpdateTeacherDto,
} from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { StudentService, StudentTopicService, UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
    private readonly studentService: StudentService,
    private readonly studentTopicService: StudentTopicService,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Get('teachers')
  async getListTeachers(@Res() res, @Req() req, @Query() query) {
    const khoa_id = req.user.khoa_id;
    const options = { query: { khoa_id, query } };
    const data = await this.userService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Get('teachers/student-topic')
  async getStudentTopic(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentTopic(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Post('student-topic')
  async createStudentTopic(
    @Res() res,
    @Req() req,
    @Body() body: CreateStudentDto,
  ) {
    const khoa_id = req.user.khoa_id;
    body.khoa_id = khoa_id;
    const data = await this.studentTopicService.create(body);
    return this.responseUtils.success({ data }, res);
  }

  @Put('student-topic/:id')
  async updateStudentTopic(
    @Param('id') id: number,
    @Res() res,
    @Body() body: CreateStudentDto,
  ) {
    const data = await this.studentTopicService.update(id, body);
    return this.responseUtils.success({ data }, res);
  }

  @Put('student-topic/:id/info')
  async updateStudentInfo(
    @Param('id') id: number,
    @Res() res,
    @Body() body: StudentInfoDto,
  ) {
    delete body.studentTopic;
    const data = await this.studentService.updateInfo(body);
    return this.responseUtils.success({ data }, res);
  }

  @Delete('student-topic/:student_id')
  async deleteStudentTopic(
    @Param('student_id') student_id: number,
    @Res() res,
  ) {
    const data = await this.studentTopicService.delete(student_id);
    return this.responseUtils.success({ data }, res);
  }

  @Post('teachers')
  async createTeacher(@Body() user: CreateUserDTO, @Res() res, @Req() req) {
    user.khoa_id = req.user.khoa_id;
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Put('teachers/:id')
  async updateTeacher(@Body() user: UpdateTeacherDto, @Res() res) {
    const { matkhau, ...data } = await this.userService.update(user);
    console.log('matkhau', matkhau);

    return this.responseUtils.success({ data }, res);
  }

  @Roles('super_admin')
  @Put('teachers/:id/reset-password')
  async resetPassword(@Param('id') id: number, @Res() res) {
    const { matkhau, ...data } = await this.userService.resetPassword(id);
    console.log('matkhau', matkhau);

    return this.responseUtils.success({ data }, res);
  }

  @Get('teachers/:id')
  async getTeacherById(@Param() id: number, @Res() res) {
    const data = await this.userService.findOne(id);
    return this.responseUtils.success({ data }, res);
  }

  @Delete('teachers/:id')
  async deleteTeacher(@Param() id: number, @Res() res) {
    const data = await this.userService.delete(id);
    return this.responseUtils.success({ data }, res);
  }

  @Post('teachers/import')
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
    if (data.status === 'success') {
      return this.responseUtils.success({ data }, res);
    } else {
      this.userService.sendExcelFile(res, data, 'error_teacher.xlsx');
    }
  }

  @Post('teachers/:id/update-role')
  async updateRole(
    @Param() id: number,
    @Body('data') role: string[],
    @Res() res,
  ) {
    const data = await this.userService.updateRole(id, role);
    return this.responseUtils.success({ data }, res);
  }
}
