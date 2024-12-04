import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateRecommendTopicDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RecommendTopicService } from 'src/services/recommend-topic.service';
import { ResponseUtils } from 'src/utils';

@Controller('recommend-topics')
@UseGuards(AuthGuard)
export class RecommendTopicController {
  constructor(
    private readonly recommendTopicService: RecommendTopicService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get()
  async getMyRecommendTopic(@Req() req, @Res() res) {
    const student_id = req.user.id;
    const data = await this.recommendTopicService.findOne({
      created_by: student_id,
    });
    return this.responseUtils.success({ data }, res);
  }

  @Post()
  async createRecommendTopic(
    @Res() res,
    @Body() body: CreateRecommendTopicDto,
  ) {
    const data = await this.recommendTopicService.create(body);
    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getRecommendTopic(@Req() req, @Res() res) {
    const data = await this.recommendTopicService.findOne(req.params.id);
    return this.responseUtils.success({ data }, res);
  }

  @Put(':id')
  async updateRecommendTopic(
    @Req() req,
    @Res() res,
    @Param('id') id: number,
    @Body() body: CreateRecommendTopicDto,
  ) {
    const data = await this.recommendTopicService.update(id, body);
    return this.responseUtils.success({ data }, res);
  }

  @Post(':id/delete')
  async deleteRecommendTopic(@Req() req, @Res() res) {
    const data = await this.recommendTopicService.delete(req.params.id);
    return this.responseUtils.success({ data }, res);
  }
}
