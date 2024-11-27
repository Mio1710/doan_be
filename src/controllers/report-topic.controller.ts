import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportTopicDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { ReportTopicService } from 'src/services';
import { ResponseUtils } from 'src/utils';
import * as stream from 'stream';

@Controller('report-topic')
@UseGuards(AuthGuard)
export class ReportTopicController {
  constructor(
    private readonly reportTopicService: ReportTopicService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createReportTopic(
    @UploadedFile() file,
    @Body() reportTopic: ReportTopicDto,
    @Res() res,
    @Req() req,
  ) {
    reportTopic.file = file;
    reportTopic.student_id = req.user.id;
    console.log('reportTopic', reportTopic);

    const data = await this.reportTopicService.create(reportTopic);
    console.log('reportTopic data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get()
  async getListReportTopics(@Res() res) {
    const data = await this.reportTopicService.getLists({});
    return this.responseUtils.success({ data }, res);
  }

  @Get('file')
  async downloadFile(@Res() res, @Query('key') fileKey: string) {
    const data = await this.reportTopicService.downloadFile(fileKey);

    res.setHeader('Content-Type', data.ContentType);
    res.setHeader('Content-Disposition', 'inline; filename*=UTF-8');
    (data.Body as stream.Readable).pipe(res);
  }

  @Get(':id')
  async getReportTopicById(@Res() res, @Param() id: number) {
    const data = await this.reportTopicService.findOne({ id });
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateReportTopic(
    @Body() reportTopic: ReportTopicDto,
    @Res() res,
    @Param() id: number,
  ) {
    const data = await this.reportTopicService.update(id, reportTopic);
    return this.responseUtils.success({ data }, res);
  }

  @Delete(':id')
  async deleteReportTopic(@Res() res, @Param() id: number) {
    const data = await this.reportTopicService.delete(id);
    return this.responseUtils.success({ data }, res);
  }
}
