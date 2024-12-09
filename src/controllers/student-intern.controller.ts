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
import { CreateStudentDto, UpdateStudentInternDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { StudentInternService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('student-intern')
export class StudentInternController {
  constructor(
    private readonly studentInternService: StudentInternService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListUsers(@Res() res, @Req() req, @Param() params) {
    const khoa_id = req.user.khoa_id;
    const data = await this.studentInternService.getLists(khoa_id, params);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createUser(@Body() student: CreateStudentDto, @Res() res) {
    const { matkhau, ...data } =
      await this.studentInternService.create(student);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() students, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;

    const data = await this.studentInternService.import(students, khoa_id);
    if (data.status === 'success') {
      return this.responseUtils.success({ data: null }, res);
    } else {
      this.studentInternService.sendExcelFile(res, data, 'error_student.xlsx');
    }
  }

  @Post('intern')
  async updateIntern(
    @Res() res,
    @Req() req,
    @Body() intern: UpdateStudentInternDto,
  ) {
    const userId = req.user.id;
    console.log('check data update', intern, userId, intern.intern_id);

    const data = await this.studentInternService.update(userId, intern);
    return this.responseUtils.success({ data }, res);
  }
}
