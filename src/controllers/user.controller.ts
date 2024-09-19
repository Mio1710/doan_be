import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/role.decorator';
import { CreateTeacherDto, UpdateTeacherDto } from 'src/dtos';
import { User } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserService } from 'src/services';
import { ResponseUtils } from 'src/utils/response.util';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}

@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class TeacherController {
  constructor(
    private readonly userService: UserService,
    private readonly responseUtils: ResponseUtils,
  ) {
    console.log('responseUtils', responseUtils);
  }

  @Get()
  getListTeachers(): Promise<User[]> {
    return this.userService.getLists();
  }

  @Post()
  async createTeacher(@Body() user: CreateTeacherDto, @Res() res) {
    const { matkhau, ...data } = await this.userService.create(user);
    console.log('matkhau', matkhau);
    return this.responseUtils.success({ data }, res);
  }

  @Put()
  async updateTeacher(@Body() user: UpdateTeacherDto, @Res() res) {
    const { matkhau, ...data } = await this.userService.update(user);
    console.log('matkhau', matkhau);

    return this.responseUtils.success({ data }, res);
  }

  @Get(':id')
  async getTeacherById(@Param() id: number, @Res() res) {
    const data = await this.userService.findOne(id);
    return this.responseUtils.success({ data }, res);
  }

  @Delete(':id')
  async deleteTeacher(@Param() id: number, @Res() res) {
    const data = await this.userService.delete(id);
    return this.responseUtils.success({ data }, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeacher(@UploadedFile() teachers, @Res() res) {
    console.log('teachersteachers', teachers);

    const data = await this.userService.import(teachers);
    return this.responseUtils.success({ data }, res);
  }
}
