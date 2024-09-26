import { HttpException, Injectable } from '@nestjs/common';
import { Semester } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async getLists(options): Promise<Semester[]> {
    return await this.semesterRepository
      .createQueryBuilder('semester')
      .leftJoinAndSelect('semester.createdBy', 'user')
      .select(['semester', 'user.ten', 'user.hodem', 'user.id'])
      .getMany();
  }

  async create(semester): Promise<Semester> {
    return this.semesterRepository.save(semester);
  }

  async update(id: number, semester: Semester) {
    return await this.semesterRepository.update(id, semester);
  }

  async delete(id: number): Promise<Semester[]> {
    const semester = await this.semesterRepository.find({ where: { id } });
    return await this.semesterRepository.remove(semester);
  }

  async findOne(options): Promise<Semester> {
    try {
      console.log('options', options);

      const semester = await this.semesterRepository.findOne({
        where: { ...options },
      });

      return semester;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async activeSemester(options): Promise<Semester> {
    try {
      // find current active semester and update options.id to active
      const currentSemester = await this.semesterRepository.findOne({
        where: { status: true },
      });

      console.log('currentSemester', currentSemester, options);

      if (currentSemester) {
        currentSemester.status = false;
        await this.semesterRepository.save(currentSemester);
      }

      const semester = await this.semesterRepository.findOne({
        where: options,
      });
      console.log('semester', semester);
      semester.status = true;
      return await this.semesterRepository.save(semester);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getActiveSemester(): Promise<number> {
    const semester = await this.semesterRepository.findOne({
      where: { status: true },
    });
    if (!semester) {
      throw new HttpException('Semester not found', 404);
    }
    return semester.id;
  }
}
