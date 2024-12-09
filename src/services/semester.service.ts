import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Semester } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getLists(options): Promise<Semester[]> {
    console.log('options', options);

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

  async getActiveSemester(): Promise<Semester> {
    const activeSemesterCache = await this.cacheManager.get('activeSemester');
    if (!activeSemesterCache) {
      const semester = await this.semesterRepository.findOne({
        where: { status: true },
        select: ['id', 'ten', 'status'],
      });
      await this.cacheManager.set('activeSemester', semester);
      return semester;
    }
    return activeSemesterCache as Semester;
  }

  async allowRegisterGroup(): Promise<boolean> {
    const semester = await this.getActiveSemester();
    if (!semester) {
      throw new HttpException('Semester not found', 404);
    }
    const currentDate = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);

    return currentDate >= startDate && currentDate <= endDate;
  }
}
