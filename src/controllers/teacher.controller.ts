import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { query } from 'express';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ResultService, UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('teacher')
export class TeacherController {
  constructor(
    private readonly userService: UserService,
    private readonly resultService: ResultService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Get('student-topic')
  async getStudentTopic(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentTopic(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-topic/result')
  async getStudentTopicResult(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentTopic(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-results-lo')
  async getStudentResultsLO(@Res() res, @Query() query) {
    const studentId = query.studentId;
    console.log('studentId222', studentId, query);

    const data = await this.resultService.getStudentResultLO(studentId);
    console.log('lo data', data);
    return this.responseUtils.success({ data }, res);
  }
}
