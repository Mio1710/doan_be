import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Student } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, UpdateResult } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { StudentSubject } from 'src/entities/studentSubject.entity';
import { IsNotIn } from 'class-validator';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentepository: Repository<Student>,
    @InjectRepository(StudentSubject)
    private studentSubjectRepository: Repository<StudentSubject>,
    private cls: ClsService,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  getLists(options): Promise<Student[]> {
    return this.studentepository.find({ ...options });
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

  async updateInfo(body): Promise<UpdateResult> {
    // check if the student exists
    const student = await this.studentepository.findOne({
      where: { maso: body.maso, id: Not(body.id) },
    });
    if (student) {
      throw new HttpException('Mã số sinh viên đã tồn tại', 400);
    }
    return await this.studentepository.update(body.id, {
      ten: body.ten,
      hodem: body.hodem,
      lop: body.lop,
      maso: body.maso,
      email: body.email,
      phone: body.phone,
    });
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
          }

          const saltOrRounds = 10;
          const hash = await bcrypt.hash('12345678', saltOrRounds);
          student.matkhau = hash;
          student.khoa_id = khoa_id;
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

  async updatePassword(userId, body): Promise<Student> {
    try {
      const student = await this.findOne({ id: userId });
      console.log('student studentsService', student);

      const oldPass = body.old_password;
      const newPassword = body.new_password;

      // check if the current password is correct
      const isMatch = await bcrypt.compare(oldPass, student.matkhau);
      if (!isMatch) {
        throw new HttpException('Mật khẩu hiện tại không đúng', 400);
      }

      // check new password is same old password
      const isSame = await bcrypt.compare(newPassword, student.matkhau);
      if (isSame) {
        throw new HttpException(
          'Mật khẩu mới không được trùng với mật khẩu cũ',
          400,
        );
      }
      // hash the new password
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(newPassword, saltOrRounds);

      // update the password
      student.matkhau = hash;
      await this.update(student);
      return;
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }
}
