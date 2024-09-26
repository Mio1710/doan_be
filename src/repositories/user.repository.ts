import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO, UpdateTeacherDto } from 'src/dtos';
import { User } from 'src/entities';
import { Repository } from 'typeorm';

interface UserOptions {
  id?: number;
  username?: string;
  email?: string;
  maso?: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(options: UserOptions): Promise<User | null> {
    console.log('options', options);

    return await this.userRepository.findOne({ where: { ...options } });
  }

  async create(user): Promise<User> {
    console.log('user before create repository', user);
    user.faculty = { id: user.khoa_id };
    return await this.userRepository.save(user);
  }

  async update(user: UpdateTeacherDto): Promise<User> {
    return await this.userRepository.save(user);
  }

  async delete(user: User): Promise<User> {
    return await this.userRepository.remove(user);
  }
}
