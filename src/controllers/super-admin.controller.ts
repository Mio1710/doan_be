import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { CreateUserDTO } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('super-admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('super_admin')
export class SuperAdminController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Post('super-teacher')
  async createSuperTeacher(@Body() user: CreateUserDTO, @Res() res) {
    user.types = ['admin'];
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhautypes', matkhau);
    return this.responseUtils.success({ data }, res);
  }
}
