import { HttpException, Injectable } from '@nestjs/common';
import { Student } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentepository: Repository<Student>,
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

      const student = await this.studentepository.findOne(options);
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
}
