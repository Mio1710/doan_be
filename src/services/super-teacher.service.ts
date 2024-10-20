import { Student } from 'src/entities';
import { SemesterService } from './semester.service';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SuperTeacherService {
  constructor(
    private readonly semesterService: SemesterService,
    @InjectRepository(Student)
    private readonly studentService: Repository<Student>,
  ) {}

  async getStudentTopic(khoa_id: number): Promise<Student[]> {
    try {
      console.log('khoa_id', khoa_id, this.semesterService);

      const activeSemester = await this.semesterService.getActiveSemester();
      console.log('activeSemester', activeSemester, khoa_id);

      const result = await this.studentService
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.studentTopic', 'studentTopic')
        .leftJoinAndSelect('studentTopic.topic', 'topic')
        .leftJoinAndSelect('topic.teacher', 'teacher')
        .where('student.khoa_id = :khoa_id', { khoa_id })
        .andWhere('studentTopic.semester_id = :semester_id', {
          semester_id: activeSemester.id,
        })
        .select([
          'student.id',
          'student.maso',
          'student.hodem',
          'student.ten',
          'student.lop',
          'teacher.id',
          'teacher.ten',
          'teacher.hodem',
          'topic.id',
          'topic.ten',
          'studentTopic.semester_id',
        ])
        .getMany();

      console.log('result', result);

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
