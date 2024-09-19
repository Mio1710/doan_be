import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from 'src/dtos';
import { StudentService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('student-topic')
export class StudentTopicController {
  constructor(
    private readonly studentService: StudentService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListUsers(@Res() res) {
    const data = await this.studentService.getLists();
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createUser(@Body() student: CreateStudentDto, @Res() res) {
    const { matkhau, ...data } = await this.studentService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() students, @Res() res) {
    console.log('students students students students students', students);

    const data = await this.studentService.import(students);
    return this.responseUtils.success({ data }, res);
  }
}
