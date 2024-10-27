import { Body, Controller, Get, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SuperTeacherService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('super-teacher')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class SuperTeacherController {
  constructor(
    private readonly superTeacherService: SuperTeacherService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Roles('super_teacher')
  @Get('student-topic')
  async getStudentTopic(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.superTeacherService.getStudentTopic(khoa_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-groups')
  async getStudentGroup(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.superTeacherService.getStudentGroup(khoa_id);
    return this.responseUtils.success({ data }, res);
  }


  @Put('student-group/lock')
  async lockStudentGroup(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.superTeacherService.lockGroup(khoa_id);
    return this.responseUtils.success({ data }, res);
  }

  @Put('teacher-group/student')
  async updateTeacherGroupStudent(@Res() res, @Body() body) {
    const data = await this.superTeacherService.updateTeacherGroupStudent(body);
    return this.responseUtils.success({ data }, res);
  }
}
