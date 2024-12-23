import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { FaculityDto } from 'src/dtos';
import { Faculity } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { FaculityService } from 'src/services';

@UseGuards(AuthGuard)
@Controller('faculities')
export class FaculityController {
  constructor(private readonly faculityService: FaculityService) {}

  @Get()
  getListFaculitys(): Promise<Faculity[]> {
    // check log
    return this.faculityService.getLists();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  createFaculity(@Body() faculity: FaculityDto): Promise<Faculity> {
    return this.faculityService.create(faculity);
  }
}
