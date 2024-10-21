import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
}
