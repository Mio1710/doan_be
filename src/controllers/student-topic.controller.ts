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
  Query,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/role.decorator';
import { CreateStudentDto, UpdateStudentTopicDto } from 'src/dtos';
import { AllowRegisterGroupGuard } from 'src/guards/allow-register-group.guard';
import { AllowStudentRegisterTopicGuard } from 'src/guards/allow-student-register-topic.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { StudentTopicService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('student-topic')
export class StudentTopicController {
  constructor(
    private readonly studentTopicService: StudentTopicService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListUsers(@Res() res, @Req() req, @Query() query) {
    const khoa_id = req.user.khoa_id;
    const data = await this.studentTopicService.getLists(khoa_id, query);
    return this.responseUtils.success({ data }, res);
  }

  @Roles('admin')
  @Roles('super_teacher')
  @Post()
  async createUser(@Body() student: CreateStudentDto, @Res() res) {
    const { matkhau, ...data } = await this.studentTopicService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Roles('admin')
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() students, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;

    const data = await this.studentTopicService.import(students, khoa_id);
    if (data.status === 'success') {
      return this.responseUtils.success({ data }, res);
    } else {
      this.studentTopicService.sendExcelFile(res, data, 'error_student.xlsx');
    }
  }

  @Get('registed')
  async getTopicRegistedDetail(@Res() res, @Req() req) {
    const userId = req.user.id;
    const data = await this.studentTopicService.getRegistedDetail(userId);
    return this.responseUtils.success({ data }, res);
  }

  @UseGuards(AllowStudentRegisterTopicGuard)
  @Post('register')
  async getTopicRegistedDetailById(
    @Res() res,
    @Req() req,
    @Body('topic_id') topic,
  ) {
    const userId = req.user.id;
    const data = await this.studentTopicService.registerTopic(userId, topic);

    return this.responseUtils.success({ data }, res);
  }

  @UseGuards(AllowStudentRegisterTopicGuard)
  @Post('topic')
  async updateTopic(
    @Res() res,
    @Req() req,
    @Body() topic: UpdateStudentTopicDto,
  ) {
    const userId = req.user.id;

    const data = await this.studentTopicService.update(userId, topic);
    return this.responseUtils.success({ data }, res);
  }

  @UseGuards(AllowStudentRegisterTopicGuard)
  @Post('cancel-topic')
  async cancelTopic(@Res() res, @Req() req) {
    const userId = req.user.id;

    const data = await this.studentTopicService.cancelTopic(userId);
    return this.responseUtils.success({ data }, res);
  }

  @Post('/cancel-group')
  async cancelGroup(@Res() res, @Req() req) {
    const userId = req.user.id;

    const data = await this.studentTopicService.cancelGroup(userId);
    return this.responseUtils.success({ data }, res);
  }

  @UseGuards(AllowRegisterGroupGuard)
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
