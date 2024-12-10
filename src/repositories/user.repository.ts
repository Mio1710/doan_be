import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateTeacherDto } from 'src/dtos';
import { User } from 'src/entities';
import { Repository, UpdateResult } from 'typeorm';

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

  async findAll(options): Promise<User[]> {
    console.log('options in repository', options);

    return await this.userRepository.find({ ...options });
  }

  async findOne(options: UserOptions): Promise<User | null> {
    console.log('options', options);

    return await this.userRepository.findOne({ where: { ...options } });
  }

  async create(user): Promise<User> {
    console.log('user before create repository', user);
    // user.faculty = { id: user?.khoa_id };
    return await this.userRepository.save(user);
  }

  async update(id: number, user: UpdateTeacherDto): Promise<UpdateResult> {
    return await this.userRepository.update(user.id, user);
  }

  async delete(user: User): Promise<UpdateResult> {
    return await this.userRepository.softDelete(user.id);
  }

  createQueryBuilder(alias?: string) {
    return this.userRepository.createQueryBuilder(alias);
  }
}
