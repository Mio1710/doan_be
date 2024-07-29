import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class FaculityRepository {
  constructor(
    @InjectRepository(Faculity)
    private readonly faculityRepository: Repository<Faculity>,
  ) {}

  async findAll(): Promise<Faculity[]> {
    return await this.faculityRepository.find();
  }

  async findOne(id: number): Promise<Faculity> {
    return await this.faculityRepository.findOne({ where: { id } });
  }

  async create(faculity): Promise<Faculity> {
    return await this.faculityRepository.save(faculity);
  }

  async update(faculity: Faculity): Promise<Faculity> {
    return await this.faculityRepository.save(faculity);
  }

  async delete(id: number): Promise<Faculity> {
    const faculity = await this.faculityRepository.findOne({ where: { id } });
    return await this.faculityRepository.remove(faculity);
  }
}
