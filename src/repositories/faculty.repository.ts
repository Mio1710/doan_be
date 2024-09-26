import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class FacultyRepository {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findAll(): Promise<Faculty[]> {
    return await this.facultyRepository.find();
  }

  async findOne(id: number): Promise<Faculty> {
    return await this.facultyRepository.findOne({ where: { id } });
  }

  async create(faculty): Promise<Faculty> {
    return await this.facultyRepository.save(faculty);
  }

  async update(faculty: Faculty): Promise<Faculty> {
    return await this.facultyRepository.save(faculty);
  }

  async delete(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    return await this.facultyRepository.remove(faculty);
  }
}
