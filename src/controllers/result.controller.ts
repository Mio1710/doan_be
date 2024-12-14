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
import { LOResultItemDto } from 'src/dtos/result.dto';
import { LO } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { LOService, ResultService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('results')
@UseGuards(AuthGuard, RolesGuard)
export class ResultController {
  constructor(
    private readonly loService: LOService,
    private readonly resultService: ResultService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListLOs(@Res() res, @Req() req) {
    const studentId = req.user.id;
    const data = await this.resultService.getStudentResult(studentId);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async updateScore(@Body() score: LOResultItemDto[], @Res() res, @Req() req) {
    const userId = req.user.id;
    const data = await this.resultService.updateScore(userId, score);
    console.log('lo data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get('lo')
  async getLOResult(@Req() req, @Res() res) {
    const userId = req.user.id;
    console.log('lo id', userId);

    const data = await this.resultService.getStudentResultLO(userId);
    console.log('lo data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateLO(@Param() id: number, @Body() lo: Partial<LO>, @Res() res) {
    console.log('lo id', id);

    const data = await this.loService.update(id, lo as LO);
    console.log('lo data', data);
    return this.responseUtils.success({ data }, res);
  }
}
