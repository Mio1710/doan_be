import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { FacultyDto } from 'src/dtos';
import { Faculty } from 'src/entities';
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
  async getListFacultys(@Res() res) {
    const data = await this.facultyService.getLists();
    return this.responseUtils.success({ data }, res);
  }

  @Roles('super_admin')
  @Post()
  createFaculty(@Body() faculty: FacultyDto): Promise<Faculty> {
    return this.facultyService.create(faculty);
  }

  @Put(':id')
  async updateFaculty(@Body() faculty: FacultyDto, @Res() res) {
    const data = await this.facultyService.update(faculty);
    return this.responseUtils.success({ data }, res);
  }
}
