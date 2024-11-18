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
import { InternService } from 'src/services';
import { ResponseUtils } from 'src/utils';
// import { UserService } from '../services/user.service';

@Controller('interns')
@UseGuards(AuthGuard, RolesGuard)
export class InternController {
  constructor(
    private readonly internService: InternService,
    // private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {}

//   @Get('teachers')
// async getTeachers(@Res() res, @Req() req) {
//   const khoa_id = req.user.khoa_id;
//   const data = await this.internService.getListTeachers(khoa_id);
//   return this.responseUtils.success({ data }, res);
// }

  @Get()
  async getListInterns(@Res() res, @Req() req, @Query() query?) {
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

    const data = await this.internService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createIntern(@Body() intern: CreateInternDto, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const student_intern_id = req.user.id;
    const data = await this.internService.create({
      ...intern,
      khoa_id,
      student_intern_id,
    });
    console.log('intenr data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get('registed')
  async getInternRegistedDetail(@Res() res) {
    const data = await this.internService.getRegistedDetail();
    console.log('intern data', data);

    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getInternById(@Param() id: number, @Res() res) {
    console.log('intern id', id);

    const data = await this.internService.findOne({ id });
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateIntern(
    @Param() id: number,
    @Body() intern: Partial<Intern>,
    @Res() res,
  ) {
    const data = await this.internService.update(id, intern as Intern);
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Post(':id/:status')
  @Roles('super_teacher')
  async activeIntern(
    @Param('id') id: number,
    @Param('status') status: string,
    @Res() res,
  ) {
    console.log('intern id', id);

    const data = await this.internService.checkIntern(id, status);
    console.log('intern data', data);
    return this.responseUtils.success({ data }, res);
  }
}
