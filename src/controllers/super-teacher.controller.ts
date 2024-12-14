import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { CreateTopicBySubjectDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SuperTeacherService, TopicService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('super-teacher')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class SuperTeacherController {
  constructor(
    private readonly superTeacherService: SuperTeacherService,
    private readonly responseUtils: ResponseUtils,
    private readonly topicService: TopicService,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Get('student-topic')
  async getStudentTopic(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.superTeacherService.getStudentTopic(khoa_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('student-groups')
  async getStudentGroup(@Res() res, @Req() req, @Query() query) {
    const khoa_id = req.user.khoa_id;
    const data = await this.superTeacherService.getStudentGroup(khoa_id, query);
    return this.responseUtils.success({ data }, res);
  }

  @Put('reset-topic')
  async resetTopic(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.topicService.resetTopic(khoa_id);
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

  @Post('topic')
  async createTopic(
    @Body() body: CreateTopicBySubjectDto,
    @Res() res,
    @Req() req,
  ) {
    const khoa_id = req.user.khoa_id;
    const data = await this.topicService.create({ ...body, khoa_id });
    return this.responseUtils.success({ data }, res);
  }
}
