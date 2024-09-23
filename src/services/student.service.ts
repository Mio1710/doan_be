import { HttpException, Injectable } from '@nestjs/common';
import { Student, Topic } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { StudentSubject } from 'src/entities/studentSubject.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentepository: Repository<Student>,
    @InjectRepository(StudentSubject)
    private studentSubjectRepository: Repository<StudentSubject>,
    private cls: ClsService,
  ) {}

  getLists(): Promise<Student[]> {
    return this.studentepository.find();
  }

  async create(student): Promise<Student> {
    log('student before create', student);
    const isExist = await this.checkExistStudent(student.maso);
    if (isExist) {
      throw new HttpException('Student already exists', 400);
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(student.matkhau, saltOrRounds);
    student.matkhau = hash;
    return this.studentepository.save(student);
  }

  update(student: Student): Promise<Student> {
    return this.studentepository.save(student);
  }

  delete(id: number) {
    return this.studentepository.softDelete(id);
  }

  async findOne(options): Promise<Student> {
    try {
      console.log('options', options);

      const student = await this.studentepository.findOne({
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
    return this.studentepository.findOne({ where: { maso, deleted_at: null } });
  }

  async import(file): Promise<Student[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(workSheet);
      console.log('data ExpressExpressExpress', data);
      const students = await Promise.all(
        data.map(async (student: Student) => {
          const isExist = await this.checkExistStudent(student.maso);
          if (isExist) {
            return;
          }

          const saltOrRounds = 10;
          const hash = await bcrypt.hash('12345678', saltOrRounds);
          student.matkhau = hash;
          console.log('user before create', student);

          return await this.studentepository.save(student);
        }),
      );

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

    result.topic = await this.studentSubjectRepository.query(`
        SELECT topic.id, topic.ten as detai, topic.description, topic.requirement, topic.knowledge, topic.created_by, user.ten, user.hodem
        FROM student_subject
        LEFT JOIN topic ON student_subject.subject_id = topic.id
        LEFT JOIN user ON topic.teacher_id = user.id
        WHERE student_subject.student_id = ${userId}
          AND student_subject.subject_type = 'topic'
      `);

    if (result.topic[0]?.id) {
      result.students = await this.studentSubjectRepository.query(`
        SELECT student.id, student.maso, student.ten, student.hodem, student.lop, student_subject.group
        FROM student_subject
        LEFT JOIN student ON student_subject.student_id = student.id
        WHERE student_subject.subject_id = ${result.topic[0].id}
          AND student_subject.subject_type = 'topic'
      `);
    }
    return result;
  }
}
