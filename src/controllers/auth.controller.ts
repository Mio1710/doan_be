import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/entities';
import { UserService, AuthService } from 'src/services';
import { ChangePasswordDto, CreateUserDTO, SingInDto } from 'src/dtos';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authServeice: AuthService,
  ) {}

  @Post('login')
  async login(@Body() body: SingInDto): Promise<any> {
    return this.authServeice.signIn(body.maso, body.matkhau, body.type);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('init-admin')
  async initAdmin(): Promise<User> {
    // check nếu có admin thì return null

    const admin: CreateUserDTO = {
      maso: 'admin',
      hodem: 'admin',
      ten: 'admin',
      email: 'admin@iuh.com',
      phone: '0123456789',
      types: ['admin'],
      matkhau: '123123123',
    };

    return this.userService.create(admin);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto): Promise<any> {
    return await this.authServeice.changePassword(
      body.matkhau,
      body.newPassword,
    );
  }

  @Post('logout')
  logout(@Request() req) {
    return this.authServeice.logout();
  }
}
