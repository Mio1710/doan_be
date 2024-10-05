import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Student, StudentTopic, Topic } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SemesterService } from './semester.service';

@Injectable()
export class StudentTopicService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(StudentTopic)
    private readonly studentTopicRepository: Repository<StudentTopic>,

    private readonly cls: ClsService,

    private readonly semesterService: SemesterService,
  ) {}

  async getLists(khoa_id, params): Promise<Student[]> {
    const semester = await this.semesterService.getActiveSemester();
    const options = {
      where: {
        khoa_id,
        studentTopic: {
          status: 'new',
          semester: { id: semester.id },
        },
      },
    };
    console.log('options1111', options, params);

    return this.studentRepository.find({ ...options });
  }

  async create(student) {
    log('student before create', student);
    let user = await this.checkExistStudent(student.maso);
    if (user) {
      console.log('Student already exists', user);
    } else {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(student.matkhau, saltOrRounds);
      student.matkhau = hash;
      user = await this.studentRepository.save(student);
    }
    // active semester
    const currentSemester = await this.semesterService.getActiveSemester();
    if (currentSemester) {
      await this.activeSemester([user.id], currentSemester.id);
    }

    return user;
  }

  async activeSemester(userIds: number[], semester_id: number) {
    console.log('in activeSemester', userIds, semester_id);

    return await this.studentTopicRepository
      .createQueryBuilder()
      .insert()
      .into(StudentTopic)
      .values(
        userIds.map((student_id) => ({
          student_id,
          semester_id,
        })),
      )
      .orUpdate(['status'], ['student_id', 'semester_id'])
      .execute();
  }

  update(student: Student): Promise<Student> {
    return this.studentRepository.save(student);
  }

  delete(id: number) {
    return this.studentRepository.softDelete(id);
  }

  async findOne(options): Promise<Student> {
    try {
      console.log('options', options);

      const student = await this.studentRepository.findOne({
        where: { ...options },
      });
      if (!student) {
        throw new HttpException('Student not found', 404);
      }
      return student;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  checkExistStudent(maso: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: { maso, deleted_at: null },
    });
  }

  async import(file, khoa_id): Promise<Student[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(workSheet);
      console.log('data ExpressExpressExpress', data);
      const students = await Promise.all(
        data.map(async (student: Student) => {
          const isExist = await this.checkExistStudent(student.maso);
          if (isExist) {
            console.log('Student already exists');
            return isExist;
          } else {
            const saltOrRounds = 10;
            const hash = await bcrypt.hash('12345678', saltOrRounds);
            student.matkhau = hash;
            student.khoa_id = khoa_id;
            console.log('user before create', student);

            return await this.studentRepository.save(student);
          }
        }),
      );
      // active semester
      console.log('studentsstudentsstudentsstudentsstudents', students);
      const currentSemester = await this.semesterService.getActiveSemester();
      const userIds = students.map((student) => student.id);
      console.log('idssssss', userIds, currentSemester);

      if (currentSemester) {
        await this.activeSemester(userIds, currentSemester.id);
      }

      return students;
    } catch (error) {
      console.log('error is_super_teacheris_super_teacher', error);

      throw new HttpException(error, 400);
    }
  }

  async getRegistedDetail() {
    const userId = this.cls.get('userId');
    const result = {
      topic: null,
      students: [],
    };

    result.topic = await this.studentTopicRepository
      .createQueryBuilder('student_topic')
      .leftJoinAndSelect('student_topic.topic', 'topic')
      .where('student_topic.student_id = :student_id', { student_id: userId })
      .getOne();

    if (result.topic[0]?.id) {
      result.students = await this.studentTopicRepository
        .createQueryBuilder('student_topic')
        .leftJoinAndSelect('student_topic.student', 'student')
        .where('student_topic.topic_id = :topic_id', {
          topic_id: result.topic[0].id,
        })
        .getMany();
    }
    return result;
  }
}
