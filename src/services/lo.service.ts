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
    await this.checkCof(LO.cof);
    return this.LORepository.save(LO);
  }

  async update(id: number, LO: LO) {
    await this.checkCof(LO.cof, id);
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

  async checkCof(cofLO: number, id?: number) {
    try {
      if (id) {
        const cof = await this.LORepository.createQueryBuilder('lo')
          .select('SUM(lo.cof)', 'cof')
          .where('lo.id != :id', { id })
          .execute();

        console.log('cof id', cof, cofLO, cof[0].cof + cofLO);

        if (cof[0].cof + cofLO > 10) {
          throw new HttpException(
            'Hệ số đã vượt qua 10. Vui lòng kiểm tra lại ',
            400,
          );
        }
      } else {
        const cof = await this.LORepository.createQueryBuilder('lo')
          .select('SUM(lo.cof)', 'cof')
          .execute();

        console.log('cof', cof, cofLO);
        if (cof[0].cof + cofLO > 10) {
          throw new HttpException(
            'Hệ số đã vượt qua 10. Vui lòng kiểm tra lại ',
            400,
          );
        }
      }
      return true;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
