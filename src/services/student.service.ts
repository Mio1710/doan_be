import { HttpException, Injectable } from '@nestjs/common';
import { Student } from 'src/entities';
import { StudentRepository } from 'src/repositories';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  private studentepository: StudentRepository;
  constructor(studentRepository: StudentRepository) {
    this.studentepository = studentRepository;
  }

  getLists(): Promise<Student[]> {
    return this.studentepository.findAll();
  }

  async create(student: Student): Promise<Student> {
    const isExist = await this.checkExistStudent(student.maso);
    if (isExist) {
      throw new HttpException('Student already exists', 400);
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(student.matkhau, saltOrRounds);
    student.matkhau = hash;
    return this.studentepository.create(student);
  }

  update(student: Student): Promise<Student> {
    return this.studentepository.update(student);
  }

  delete(id: number): Promise<Student> {
    return this.studentepository.delete(id);
  }

  findOne(options): Promise<Student> {
    return this.studentepository.findOne(options);
  }

  checkExistStudent(maso: string): Promise<Student> {
    return this.studentepository.findOne({ maso });
  }
}
