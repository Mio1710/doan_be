import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserService } from 'src/services';
import { ResponseUtils } from 'src/utils';

@Controller('public')
@UseGuards(AuthGuard)
export class PublicController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {}

  @Get('teachers')
  async getListTeachers(@Res() res, @Req() req, @Query() query) {
    const khoa_id = req.user.khoa_id;
    const options = { query: { khoa_id, query } };
    const data = await this.userService.getLists(options);
    return this.responseUtils.success({ data }, res);
  }
}
