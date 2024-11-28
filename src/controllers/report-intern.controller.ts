import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
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
  import { ReportInternDto, UpdateReportInternDto } from 'src/dtos';
  import { AuthGuard } from 'src/guards/auth.guard';
  import { ReportInternService } from 'src/services';
  import { ResponseUtils } from 'src/utils';
  import * as stream from 'stream';
  
  @Controller('report-intern')
  @UseGuards(AuthGuard)
  export class ReportInternController {
    constructor(
      private readonly reportInternService: ReportInternService,
      private readonly responseUtils: ResponseUtils,
    ) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async createReportIntern(
      @UploadedFile() file,
      @Body() reportIntern: ReportInternDto,
      @Res() res,
      @Req() req,
    ) {
      if (!file) {
        throw new HttpException('File không được để trống', 400);
      }
      reportIntern.file = file;
      reportIntern.student_id = req.user.id;
      console.log('reportIntern', reportIntern);
  
      const data = await this.reportInternService.create(reportIntern);
      console.log('reportIntern data create', data);
      return this.responseUtils.success({ data }, res);
    }
  
    @Get()
    async getListReportInterns(@Res() res, @Req() req) {
      const studentId = req.user.id;
      const data = await this.reportInternService.getLists({
        student_id: studentId,
      });
      return this.responseUtils.success({ data }, res);
    }
  
    @Get('file')
    async downloadFile(@Res() res, @Query('key') fileKey: string) {
      const data = await this.reportInternService.downloadFile(fileKey);
  
      res.setHeader('Content-Type', data.ContentType);
      res.setHeader('Content-Disposition', 'inline; filename*=UTF-8');
      (data.Body as stream.Readable).pipe(res);
    }
  
    @Get(':id')
    async getReportInternById(@Res() res, @Param() id: number) {
      const data = await this.reportInternService.findOne({ id });
      return this.responseUtils.success({ data }, res);
    }
  
    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    async updateReportTopic(
      @UploadedFile() file,
      @Body() reportIntern: ReportInternDto,
      @Res() res,
      @Param('id') id: number,
    ) {
      reportIntern.file = file;
      const data = await this.reportInternService.update(id, reportIntern);
      return this.responseUtils.success({ data }, res);
    }
  
    @Delete(':id')
    async deleteReportIntern(@Res() res, @Param() id: number) {
      const data = await this.reportInternService.delete(id);
      return this.responseUtils.success({ data }, res);
    }
  }
  