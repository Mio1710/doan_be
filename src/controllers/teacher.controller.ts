import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
}
