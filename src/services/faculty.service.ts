import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacultyDto } from 'src/dtos';
import { Faculty } from 'src/entities';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async getLists(options): Promise<Faculty[]> {
    return await this.facultyRepository.find({ ...options });
  }

  async create(faculty): Promise<Faculty> {
    // check faculty exist
    const isExist = await this.facultyRepository
      .createQueryBuilder('faculty')
      .where('faculty.ten = :ten', { ten: faculty.ten })
      .orWhere('faculty.ma_khoa = :ma_khoa', { ma_khoa: faculty.ma_khoa })
      .getOne();
    if (isExist) {
      throw new HttpException('Tên khoa/ Mã khoa đã tồn tại', 400);
    }
    return await this.facultyRepository.save(faculty);
  }

  async update(id: number, faculty: FacultyDto): Promise<UpdateResult> {
    try {
      return await this.facultyRepository.update(id, faculty);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async delete(id: number): Promise<UpdateResult> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new HttpException('Khoa không tồn tại', 400);
    }

    return await this.facultyRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id })
      .execute();
  }

  async findOne(id: number): Promise<Faculty> {
    return await this.facultyRepository.findOne({ where: { id } });
  }

  async getFacultyWithAdmins(): Promise<Faculty[]> {
    return await this.facultyRepository
      .createQueryBuilder('faculty')
      .leftJoinAndSelect(
        'faculty.teachers',
        'teachers',
        // Subquery to filter teachers with the 'admin' role
        `teachers.id IN (
        SELECT id FROM user WHERE JSON_CONTAINS(roles, :role) = 1 and deleted_at is null
      )`,
        { role: '"admin"' },
      )
      .select([
        'faculty.id',
        'faculty.ten',
        'faculty.ma_khoa',
        'teachers.id',
        'teachers.maso',
        'teachers.hodem',
        'teachers.ten',
        'teachers.email',
        'teachers.phone',
      ])
      .getMany();
  }
}
