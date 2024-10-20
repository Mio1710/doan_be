import { HttpException, Injectable } from '@nestjs/common';
import { LO } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LOService {
  constructor(
    @InjectRepository(LO)
    private readonly LORepository: Repository<LO>,
  ) {}

  async getLists(options): Promise<LO[]> {
    return await this.LORepository.find({ ...options });
  }

  async create(LO): Promise<LO> {
    return this.LORepository.save(LO);
  }

  async update(id: number, LO: LO) {
    return await this.LORepository.update(id, LO);
  }

  async delete(id: number): Promise<LO[]> {
    const LO = await this.LORepository.find({ where: { id } });
    return await this.LORepository.remove(LO);
  }

  async findOne(options): Promise<LO> {
    try {
      console.log('options', options);

      const LO = await this.LORepository.findOne({
        where: { ...options },
      });

      return LO;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getStudentResult(student_id) {
    try {
      const studentTopic = { student_id };

      return studentTopic;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
