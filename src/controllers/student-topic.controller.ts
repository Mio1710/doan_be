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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from 'src/dtos';
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
  async getListUsers(@Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const options = { where: { khoa_id } };
    const data = await this.studentTopicService.getLists(options);
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
  async getTopicRegistedDetail(@Res() res) {
    const data = await this.studentTopicService.getRegistedDetail();
    console.log('topic data', data);

    return this.responseUtils.success({ data }, res);
  }
}
