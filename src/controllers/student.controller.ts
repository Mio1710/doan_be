import { Controller, Get, Post, Res, Body } from '@nestjs/common';
import { CreateStudentDto } from 'src/dtos';
import { Student } from 'src/entities';
import { StudentService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  getListUsers(): Promise<Student[]> {
    return this.studentService.getLists();
  }

  @Post()
  async createUser(@Body() student: CreateStudentDto, @Res() res) {
    const { matkhau, ...data } = await this.studentService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }
}
