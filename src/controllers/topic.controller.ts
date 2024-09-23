import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Param,
  UseGuards,
  Put,
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
  async getListTopics(@Res() res) {
    const data = await this.topicService.getLists();
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createTopic(@Body() topic: CreateTopicDto, @Res() res) {
    const data = await this.topicService.create(topic);
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
