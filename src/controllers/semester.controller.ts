import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CreateSemesterDto } from 'src/dtos';
import { Semester } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { SemesterService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('semesters')
@UseGuards(AuthGuard, RolesGuard)
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListSemesters(): Promise<Semester[]> {
    const options = { relations: ['createdBy'] };

    return await this.semesterService.getLists(options);
  }

  @Post()
  async createSemester(@Body() semester: CreateSemesterDto, @Res() res) {
    const data = await this.semesterService.create(semester);
    console.log('semester data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getSemesterById(@Param() id: number, @Res() res) {
    console.log('semester id', id);

    const data = await this.semesterService.findOne({ id });
    console.log('semester data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateSemester(
    @Param() id: number,
    @Body() semester: Partial<Semester>,
    @Res() res,
  ) {
    console.log('semester id', id);

    const data = await this.semesterService.update(id, semester as Semester);
    console.log('semester data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Post('active/:id')
  async activeSemester(@Param() id: number, @Res() res) {
    console.log('semester id', id);

    const data = await this.semesterService.activeSemester(id);
    console.log('semester data', data);
    return this.responseUtils.success({ data }, res);
  }
}
