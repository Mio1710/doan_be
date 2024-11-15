import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService, StudentService } from '../services';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private studentService: StudentService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    maso: string,
    pass: string,
    type?: string,
  ): Promise<{ access_token: string }> {
    let user;
    let typeUser = 'student';
    if (type) {
      console.log('type', type);
      user = await this.usersService.findOne({ maso: maso });
      typeUser = user.roles;
    } else {
      console.log('type student', type);
      user = await this.studentService.findOne({ maso: maso });
      console.log('user student', user, maso);
    }
    console.log('user', user);
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
      roles: typeUser,
      khoa_id: user.khoa_id ?? null,
    };
    console.log('payload before return', payload);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async changePassword(user, data) {
    // get current user's password
    try {
      const userId = user.id;
      const roles = user.roles;
      if (roles.includes('student')) {
        return this.studentService.updatePassword(userId, data);
      } else {
        return this.usersService.updatePassword(userId, data);
      }
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }

  async logout() {
    return;
  }

  async getProfile(user) {
    try {
      console.log('userrrrrrrrr', user);

      if (user.roles == 'student') {
        const student = await this.studentService.findOne({ id: user.id });
        return { ...student, roles: ['student'] };
      } else {
        return await this.usersService.findOne({ id: user.id });
      }
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }

  async updateProfile(user, data) {
    try {
      const userId = user.id;
      const roles = user.roles;
      if (roles.includes('student')) {
        const student = await this.studentService.findOne({ id: userId });
        student.phone = data.phone;
        return this.studentService.update(student);
      } else {
        const user = await this.usersService.findOne({ id: userId });
        user.phone = data.phone;
        return this.usersService.update(user);
      }
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }
}
