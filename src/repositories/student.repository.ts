import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/entities';
import { Repository } from 'typeorm';

interface StudentOptions {
  id?: number;
  username?: string;
  email?: string;
  maso?: string;
}

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async findOne(options: StudentOptions): Promise<Student> {
    return await this.studentRepository.findOne({ where: { ...options } });
  }

  async create(Student: Student): Promise<Student> {
    return await this.studentRepository.save(Student);
  }

  async update(Student: Student): Promise<Student> {
    return await this.studentRepository.save(Student);
  }

  async delete(id: number): Promise<Student> {
    const Student = await this.studentRepository.findOne({ where: { id } });
    return await this.studentRepository.remove(Student);
  }
}
