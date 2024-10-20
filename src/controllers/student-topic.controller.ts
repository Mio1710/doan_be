import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto, UpdateStudentTopicDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SemesterService, StudentTopicService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('student-topic')
export class StudentTopicController {
  constructor(
    private readonly studentTopicService: StudentTopicService,
    private readonly semesterService: SemesterService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListUsers(@Res() res, @Req() req, @Param() params) {
    const khoa_id = req.user.khoa_id;
    const data = await this.studentTopicService.getLists(khoa_id, params);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createUser(@Body() student: CreateStudentDto, @Res() res) {
    const { matkhau, ...data } = await this.studentTopicService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() students, @Res() res, @Req() req) {
    console.log('students students students students students', students);
    const khoa_id = req.user.khoa_id;

    const data = await this.studentTopicService.import(students, khoa_id);
    return this.responseUtils.success({ data }, res);
  }

  @Get('registed')
  async getTopicRegistedDetail(@Res() res, @Req() req) {
    try {
      const userId = req.user.id;
      const data = await this.studentTopicService.getRegistedDetail(userId);
      console.log('topic data', data);

      return this.responseUtils.success({ data }, res);
    } catch (error) {
      console.log('error', error);
    }
  }

  @Post('register')
  async getTopicRegistedDetailById(@Res() res, @Req() req, @Body() topic) {
    const userId = req.user.id;
    const data = await this.studentTopicService.update(userId, topic);

    return this.responseUtils.success({ data }, res);
  }

  @Post('topic')
  async updateTopic(
    @Res() res,
    @Req() req,
    @Body() topic: UpdateStudentTopicDto,
  ) {
    const userId = req.user.id;
    console.log('check data update', topic, userId, topic.topic_id);

    const data = await this.studentTopicService.update(userId, topic);
    return this.responseUtils.success({ data }, res);
  }

  @Post('/cancel-group')
  async cancelGroup(@Res() res, @Req() req) {
    const userId = req.user.id;

    const data = await this.studentTopicService.cancelGroup(userId);
    return this.responseUtils.success({ data }, res);
  }

  @Post('/create-group')
  async createGroup(
    @Res() res,
    @Body('partner_id') partnerId: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    console.log('userIds', userId, partnerId);

    const data = await this.studentTopicService.createGroup(userId, partnerId);
    return this.responseUtils.success({ data }, res);
  }
}
