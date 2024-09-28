import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from 'src/dtos';
import { StudentService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('students')
export class StudentController {
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
  async createUser(@Body() student: CreateStudentDto, @Res() res, @Req() req) {
    student.khoa_id = req.user.khoa_id;
    const { matkhau, ...data } = await this.studentService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() students, @Res() res, @Req() req) {
    console.log('students students students students students', students);
    const khoa_id = req.user.khoa_id;
    const data = await this.studentService.import(students, khoa_id);
    return this.responseUtils.success({ data }, res);
  }
}
