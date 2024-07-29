import { Injectable } from '@nestjs/common';
import { Faculity } from 'src/entities';
import { FaculityRepository } from 'src/repositories';

@Injectable()
export class FaculityService {
  private faculityepository: FaculityRepository;
  constructor(faculityRepository: FaculityRepository) {
    this.faculityepository = faculityRepository;
  }

  getLists(): Promise<Faculity[]> {
    return this.faculityepository.findAll();
  }

  create(faculity): Promise<Faculity> {
    return this.faculityepository.create(faculity);
  }

  update(faculity: Faculity): Promise<Faculity> {
    return this.faculityepository.update(faculity);
  }

  delete(id: number): Promise<Faculity> {
    return this.faculityepository.delete(id);
  }

  findOne(id: number): Promise<Faculity> {
    return this.faculityepository.findOne(id);
  }
}
