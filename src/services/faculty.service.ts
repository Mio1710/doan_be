import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacultyDto } from 'src/dtos';
import { Faculty } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async getLists(): Promise<Faculty[]> {
    return await this.facultyRepository.find();
  }

  async create(faculty): Promise<Faculty> {
    return await this.facultyRepository.save(faculty);
  }

  async update(faculty: FacultyDto): Promise<Faculty> {
    return await this.facultyRepository.save(faculty);
  }

  async delete(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    return await this.facultyRepository.remove(faculty);
  }

  async findOne(id: number): Promise<Faculty> {
    return await this.facultyRepository.findOne({ where: { id } });
  }
}
