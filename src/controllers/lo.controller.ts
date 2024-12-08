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
} from '@nestjs/common';
import { CreateLODto } from 'src/dtos';
import { LO } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { LOService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('los')
@UseGuards(AuthGuard, RolesGuard)
export class LOController {
  constructor(
    private readonly loService: LOService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListLOs(@Res() res) {
    const data = await this.loService.getLists({});
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createLO(@Body() lo: CreateLODto, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.loService.create({ ...lo, khoa_id });
    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getLOById(@Param() id: number, @Res() res) {
    console.log('lo id', id);

    const data = await this.loService.findOne({ id });
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateLO(@Param('id') id: number, @Body() lo: Partial<LO>, @Res() res) {
    console.log('lo id', id);

    const data = await this.loService.update(id, lo as LO);
    return this.responseUtils.success({ data }, res);
  }
}
