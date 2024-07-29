import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService, StudentService } from '../services';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private studentService: StudentService,
    private jwtService: JwtService,
    private clsService: ClsService,
  ) {}

  async signIn(
    maso: string,
    pass: string,
    type?: string,
  ): Promise<{ access_token: string }> {
    let user;
    let typeUser = 'student';
    if (type) {
      user = await this.usersService.findOne({ maso: maso });
      typeUser = user.type;
    } else {
      user = await this.studentService.findOne({ maso: maso });
    }
    console.log('user neffffffff', user, pass, user.matkhau);

    if (!user) {
      throw new UnauthorizedException();
    } else {
      const isMatch = await bcrypt.compare(pass, user.matkhau);
      if (!isMatch) {
        throw new UnauthorizedException();
      }
    }

    const payload = {
      sub: user.maso,
      id: user.id,
      role: typeUser,
    };
    console.log('payload before return', payload);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async changePassword(oldPass: string, newPassword: string) {
    // get current user's password
    try {
      const userId = this.clsService.get('userId');
      console.log('userId', userId);

      const user = await this.usersService.findOne({ id: userId });
      console.log('user usersService', user);

      // check if the current password is correct
      const isMatch = await bcrypt.compare(oldPass, user.matkhau);
      if (!isMatch) {
        throw new HttpException('Current password is incorrect', 400);
      }
      // hash the new password
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(newPassword, saltOrRounds);

      // update the password
      user.matkhau = hash;
      await this.usersService.update(user);
      return;
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }
}
