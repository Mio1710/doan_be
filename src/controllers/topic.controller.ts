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
import { CreateTopicDto } from 'src/dtos';
import { Topic } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { TopicService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('topics')
@UseGuards(AuthGuard, RolesGuard)
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getListTopics(@Res() res, @Req() req, @Query() query?) {
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

    const data = await this.topicService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTopic(@Body() topic: CreateTopicDto, @Res() res, @Req() req) {
    const khoa_id = req.user.khoa_id;
    const data = await this.topicService.create({ ...topic, khoa_id });
    console.log('topic data create', data);
    return this.responseUtils.success({ data }, res);
  }

  @Get('registed')
  async getTopicRegistedDetail(@Res() res) {
    const data = await this.topicService.getRegistedDetail();
    console.log('topic data', data);

    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getTopicById(@Param() id: number, @Res() res) {
    console.log('topic id', id);

    const data = await this.topicService.findOne({ id });
    console.log('topic data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateTopic(
    @Param() id: number,
    @Body() topic: Partial<Topic>,
    @Res() res,
  ) {
    const data = await this.topicService.update(id, topic as Topic);
    console.log('topic data', data);
    return this.responseUtils.success({ data }, res);
  }

  @Post(':id/:status')
  @Roles('super_teacher')
  async activeTopic(
    @Param('id') id: number,
    @Param('status') status: string,
    @Res() res,
  ) {
    console.log('topic id', id);

    const data = await this.topicService.checkTopic(id, status);
    console.log('topic data', data);
    return this.responseUtils.success({ data }, res);
  }
}
