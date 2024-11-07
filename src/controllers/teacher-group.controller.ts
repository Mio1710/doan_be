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
  Delete,
} from '@nestjs/common';
import { TeacherGroupCreateDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { TeacherGroupSerivce } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('teacher-groups')
@UseGuards(AuthGuard, RolesGuard)
export class TeacherGroupController {
  constructor(
    private readonly teacherGroupService: TeacherGroupSerivce,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListTeacherGroups(@Res() res, @Req() req, @Query() query?) {
    console.log('params1111', query.filter);
    const khoa_id = req.user.khoa_id;
    const options = { khoa_id };
    if (query?.semester_id) {
      options['semester_id'] = query.semester_id;
    }

    const data = await this.teacherGroupService.getListGroups(options, khoa_id);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTeacherGroup(
    @Body() teacherGroup: TeacherGroupCreateDto,
    @Res() res,
    @Req() req,
  ) {
    const khoa_id = req.user.khoa_id;
    const data = await this.teacherGroupService.create(teacherGroup, khoa_id);
    console.log('teacherGroup data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getTeacherGroupById(@Param() id: number, @Res() res) {
    console.log('teacherGroup id', id);

    const data = await this.teacherGroupService.getOne(id);
    console.log('teacherGroup data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateTeacherGroup(
    @Param('id') id: number,
    @Body() teacherGroup: TeacherGroupCreateDto,
    @Res() res,
  ) {
    const data = await this.teacherGroupService.update(id, teacherGroup);
    console.log('teacherGroup data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Delete(':id')
  async deleteTeacherGroup(@Param('id') id: number, @Res() res) {
    const data = await this.teacherGroupService.delete(id);
    return this.responseUtils.success({ data }, res);
  }
}
