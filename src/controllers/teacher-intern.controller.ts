import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Param,
  UseGuards,
  Put,
  Req,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { CreateInternDto } from 'src/dtos';
import { Intern } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { TeacherInternService } from 'src/services';
import { ResponseUtils } from 'src/utils';
// import { UserService } from '../services/user.service';

@Controller('teacher-interns')
@UseGuards(AuthGuard, RolesGuard)
export class TeacherInternController {
  constructor(
    private readonly teacherInternService: TeacherInternService,
    // private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListTeacherInterns(@Res() res, @Req() req, @Query() query?) {
    console.log('params1111', query.filter);
    const khoa_id = req.user.khoa_id;
    const viewAll = query.filter?.viewAll == 'true' ? true : false;
    const options = { khoa_id, viewAll };
    if (query?.semester_id) {
      options['semester_id'] = query.semester_id;
    }

    if (query.filter.status) {
      //set filter to object
      console.log('status neffffff', query.filter.status);
      options['status'] = query.filter.status;
    }
    
    const data = await this.teacherInternService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTeacherIntern(@Body() intern: CreateInternDto, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const student_intern_id = req.user.id;
    const data = await this.teacherInternService.create({
      ...intern,
      khoa_id,
      student_intern_id,
    });
    console.log('intern data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get('registed')
  async getInternRegistedDetail(@Res() res) {
    const data = await this.teacherInternService.getRegistedDetail();
    console.log('intern data', data);

    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getTeacherInternById(@Param() id: number, @Res() res) {
    console.log('intern id', id);

    const data = await this.teacherInternService.findOne({ id });
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateTeacherIntern(
    @Param() id: number,
    @Body() intern: Partial<Intern>,
    @Res() res,
  ) {
    const data = await this.teacherInternService.update(id, intern as Intern);
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Post(':id/:status')
  @Roles('teacher')
  async activeIntern(
    @Param('id') id: number,
    @Param('status') status: string,
    @Res() res,
  ) {
    console.log('intern id', id);

    const data = await this.teacherInternService.checkTeacherIntern(id, status);
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }
}
