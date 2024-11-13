import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { FacultyDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { FacultyService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@UseGuards(AuthGuard, RolesGuard)
@Controller('faculties')
export class FacultyController {
  constructor(
    private readonly facultyService: FacultyService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListFacultys(@Res() res, @Query() query) {
    const filter = query.filter;
    const options = {
      ...filter,
    };

    const data = await this.facultyService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Roles('super_admin')
  @Post()
  async createFaculty(@Body() faculty: FacultyDto, @Res() res) {
    const data = await this.facultyService.create(faculty);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateFaculty(@Body() faculty: FacultyDto, @Res() res) {
    const data = await this.facultyService.update(faculty);
    return this.responseUtils.success({ data }, res);
  }

  @Delete(':id')
  async deleteFaculty(@Param('id') id: number, @Res() res) {
    const data = await this.facultyService.delete(id);
    return this.responseUtils.success({ data }, res);
  }
}
