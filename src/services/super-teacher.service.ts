import { Group, Student, StudentTopic } from 'src/entities';
import { SemesterService } from './semester.service';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class SuperTeacherService {
  constructor(
    private readonly semesterService: SemesterService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @InjectRepository(StudentTopic)
    private readonly studentTopicRepository: Repository<StudentTopic>,
  ) {}

  async getStudentTopic(khoa_id: number): Promise<Student[]> {
    try {
      console.log('khoa_id', khoa_id, this.semesterService);

      const activeSemester = await this.semesterService.getActiveSemester();
      console.log('activeSemester', activeSemester, khoa_id);

      const result = await this.studentRepository
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
          'studentTopic.group_id',
        ])
        .getMany();

      console.log('result', result);

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async lockGroup(khoa_id: number) {
    try {
      //get list student haven't join group
      const activeSemester = await this.semesterService.getActiveSemester();
      const listStudent = await this.studentRepository.find({
        where: {
          khoa_id,
          studentTopic: { semester_id: activeSemester.id, group_id: IsNull() },
        },
      });

      // lock group
      await listStudent.map(async (student) => {
        // check if student already join group
        const isExist = await this.groupRepository
          .createQueryBuilder('group')
          .where('first_partner_id = :student_id', { student_id: student.id })
          .orWhere('second_partner_id = :student_id', {
            student_id: student.id,
          })
          .getOne();
        let group_id = null;
        if (isExist) group_id = isExist.id;
        else {
          const newGroup = await this.groupRepository.save({
            first_partner_id: student.id,
          });
          group_id = newGroup.id;
        }
        await this.studentTopicRepository
          .createQueryBuilder()
          .update()
          .set({ group_id })
          .where('student_id = :student_id', { student_id: student.id })
          .execute();
      });
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getStudentGroup(khoa_id: number) {
    try {
      const activeSemester = await this.semesterService.getActiveSemester();
      const options = {
        studentTopics: {
          semester_id: activeSemester.id,
          student: { khoa_id },
        },
      };
      const result = await this.groupRepository.find({
        where: { ...options },
        relations: {
          studentTopics: {
            student: true,
            topic: true,
          },
          teacherGroup: {
            teachers: {
              teacher: true,
            },
          },
        },
        select: {
          id: true,
          first_partner_id: true,
          second_partner_id: true,
          studentTopics: {
            id: true,
            status: true,
            student_id: true,
            topic_id: true,
            student: {
              id: true,
              maso: true,
              hodem: true,
              ten: true,
              lop: true,
            },
            topic: {
              id: true,
              ten: true,
            },
          },
          teacherGroup: {
            id: true,
            name: true,
            teachers: {
              id: true,
              teacher: {
                id: true,
                ten: true,
                hodem: true,
                maso: true,
              },
            },
          },
        },
      });

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async updateTeacherGroupStudent(data) {
    try {
      console.log('data', data);
      const { teacher_group_id, student_group_ids } = data;
      await this.groupRepository
        .createQueryBuilder('group')
        .update()
        .set({ teacherGroup: { id: teacher_group_id } })
        .where('id IN (:...student_group_ids)', { student_group_ids })
        .execute();

      return true;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
