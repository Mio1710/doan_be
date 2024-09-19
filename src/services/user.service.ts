import { HttpException, Injectable } from '@nestjs/common';
import { User } from 'src/entities';
import { UserRepository } from 'src/repositories';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { UpdateTeacherDto } from 'src/dtos';

// manage teacher/admin
// need exclude password field

@Injectable()
export class UserService {
  private useRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.useRepository = userRepository;
  }

  getLists(): Promise<User[]> {
    return this.useRepository.findAll();
  }

  async create(user): Promise<User> {
    const isExist = await this.checkExistUser(user.maso);
    if (isExist) {
      throw new HttpException('User already exists', 400);
    }
    console.log('user before create', user);

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(user.matkhau, saltOrRounds);
    user.matkhau = hash;
    return this.useRepository.create(user);
  }

  async update(user: UpdateTeacherDto): Promise<User> {
    try {
      return await this.useRepository.update(user);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async delete(id): Promise<User> {
    try {
      const user = await this.useRepository.findOne(id);
      console.log('user', user);

      return await this.useRepository.delete(user);
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async findOne(options): Promise<User> {
    try {
      console.log('options', options);

      const user = await this.useRepository.findOne(options);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return user;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  checkExistUser(maso: string): Promise<User> {
    return this.useRepository.findOne({ maso });
  }

  async import(file): Promise<User[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(workSheet);
      console.log('data ExpressExpressExpress', data);
      const users = await Promise.all(
        data.map(async (user: User) => {
          const isExist = await this.checkExistUser(user.maso);
          if (isExist) {
            return;
          }

          user.types = ['teacher'];
          if (user.is_super_teacher == 1) {
            user.types.push('super_teacher');
          }
          if (user.is_admin == 1) {
            user.types.push('admin');
          }

          const saltOrRounds = 10;
          const hash = await bcrypt.hash('12345678', saltOrRounds);
          user.matkhau = hash;
          console.log('user before create', user);

          return await this.useRepository.create(user);
        }),
      );

      return users;
    } catch (error) {
      console.log('error is_super_teacheris_super_teacher', error);

      throw new HttpException(error, 400);
    }
  }
}
