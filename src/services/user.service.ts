import { HttpException, Injectable } from '@nestjs/common';
import { User } from 'src/entities';
import { UserRepository } from 'src/repositories';
import * as bcrypt from 'bcrypt';
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
}
