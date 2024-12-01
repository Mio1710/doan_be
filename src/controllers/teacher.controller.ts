import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RecommendTopicService, ReportTopicService, ReportInternService, ResultService, UserService } from 'src/services';

import { ResponseUtils } from 'src/utils/response.util';

@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('teacher')
export class TeacherController {
  constructor(
    private readonly userService: UserService,
    private readonly reportTopicService: ReportTopicService,
    private readonly reportInternService: ReportInternService,
    private readonly resultService: ResultService,
    private readonly recommendTopicService: RecommendTopicService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListTeachers(@Res() res, @Req() req, @Query() query) {
    const khoa_id = req.user.khoa_id;
    const options = { query: { khoa_id, query } };
    const data = await this.userService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-topic')
  async getStudentTopic(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentTopic(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-intern')
  async getStudentIntern(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentIntern(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-topic/result')
  async getStudentTopicResult(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    const data = await this.userService.getStudentTopic(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-topic/report')
  async getStudentTopicReport(@Res() res, @Req() req, @Query() query) {
    const studentId = query?.filter?.studentId;
    console.log('studentId', studentId, query);
    const data = await this.reportTopicService.getLists({
      student_id: studentId,
    });
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-intern/report')
  async getStudentInternReport(@Res() res, @Req() req, @Query() query) {
    const studentId = query?.filter?.studentId;
    console.log('studentId', studentId, query);
    
    if (!studentId) {
      throw new HttpException('Student id is required', 400);
    }
    const data = await this.reportInternService.getLists({
      student_id: studentId,
    });
    return this.responseUtils.success({ data }, res);
  }  

  @Get('student-topic/recommend-topics')
  async getStudentRecommendTopic(@Res() res, @Req() req) {
    const teacher_id = req.user.id;
    console.log('teacher_id', teacher_id);

    const data = await this.recommendTopicService.getListByTeacher(teacher_id);
    return this.responseUtils.success({ data }, res);
  }

  @Put('student-topic/report/:id/comment')
  async updateStudentTopicReport(
    @Res() res,
    @Body('comment') body,
    @Param('id') reportId,
  ) {
    const data = await this.reportTopicService.commentReportTopic(
      reportId,
      body,
    );
    return this.responseUtils.success({ data }, res);
  }

  @Put('student-intern/report/:id/comment')
  async updateStudentInternReport(
    @Res() res,
    @Body('comment') body,
    @Param('id') reportId,
  ) {
    const data = await this.reportInternService.commentReportIntern(
      reportId,
      body,
    );
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-results-lo')
  async getStudentResultsLO(@Res() res, @Query() query) {
    const studentId = query.studentId;
    const data = await this.resultService.getStudentResultLO(studentId);
    console.log('lo data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put('student-results-lo')
  async updateStudentResultsLO(@Res() res, @Body() body) {
    console.log('body', body);

    const data = await this.resultService.updateStudentResultLO(body);
    console.log('lo data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put('change-password')
  async updatePassword(@Res() res, @Body() body, @Req() req) {
    const user_id = req.user.id;

    const data = await this.userService.updatePassword(user_id, body);
    return this.responseUtils.success({ data }, res);
  }
}
