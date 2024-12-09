import { HttpException, Injectable } from '@nestjs/common';
import { Student, StudentIntern } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SemesterService } from './semester.service';
import { format } from 'date-fns';
import { ImportStudentDto } from 'src/dtos';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';

@Injectable()
export class StudentInternService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(StudentIntern)
    private readonly studentInternRepository: Repository<StudentIntern>,

    private readonly cls: ClsService,

    private readonly semesterService: SemesterService,
  ) {}

  // async getLists(khoa_id, params): Promise<Student[]> {
  //   const semester = await this.semesterService.getActiveSemester();
  //   const options = {
  //     select: {
  //       id: true,
  //       maso: true,
  //       hodem: true,
  //       ten: true,
  //       email: true,
  //       lop: true,
  //       StudentIntern: {
  //         id: true,
  //         intern: {
  //           company_name: true,
  //         },
  //       },

  //     },
  //     where: {
  //       khoa_id,
  //       studentIntern: {
  //         intern_status: 'new',
  //         semester: { id: semester.id },
  //       },
  //     },
  //     relations: ['studentIntern'],
  //   };

  //   console.log('options1111', options, params);

  //   return this.studentRepository.find({ ...options });
  // }async getLists(khoa_id: number): Promise<Student[]> {
  async getLists(khoa_id, params): Promise<Student[]> {
    const semester = await this.semesterService.getActiveSemester();

    const options = {
        select: {
            id: true,
            maso: true,
            hodem: true,
            ten: true,
            email: true,
            lop: true,
            phone: true,
            studentIntern: {
                intern: {
                    company_name: true,
                    teacher: {
                        hodem: true,
                        ten: true,
                    },
                },
            },
        },
        where: {
            khoa_id: khoa_id,
            studentIntern: {
                status: 'new',
                semester_id: semester.id,
            },
        },
        relations: {
            studentIntern: {
                intern: {
                    teacher: true,
                },
            },
        },
    };

    return this.studentRepository.find(options);
}


  async find(options): Promise<StudentIntern[]> {
    return this.studentInternRepository.find(options);
  }

  async create(student) {
    log('student before create', student);
    let user = await this.checkExistStudent(student.maso);
    const currentSemester = await this.semesterService.getActiveSemester();
    if (user) {
      console.log('Student already exists', user);
      // check if student already in semester
      const studentIntern = await this.checkExistStudentIntern(
        user.id,
        currentSemester.id,
      );
      if (studentIntern) {
        throw new HttpException('Student already exists', 400);
      } else {
        await this.activeSemester([user.id], currentSemester.id);
      }
    } else {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(student.matkhau, saltOrRounds);
      student.matkhau = hash;
      user = await this.studentRepository.save(student);
    }
    // active semester
    // const currentSemester = await this.semesterService.getActiveSemester();
    if (currentSemester) {
      await this.activeSemester([user.id], currentSemester.id);
    }

    return user;
  }

  async activeSemester(userIds: number[], semester_id: number) {
    console.log('in activeSemester', userIds, semester_id);

    userIds.map(async (student_id) => {
      const studentIntern = await this.studentInternRepository.findOne({
        where: { student_id, semester_id },
      });
      if (!studentIntern) {
        await this.studentInternRepository.save({
          student_id,
          semester_id,
        });
      }
    });
  }

  async update(studentId: number, data): Promise<StudentIntern> {
    try {
      const studentIntern = await this.findOne({ student_id: studentId });
      console.log('studentIntern11111', data, studentIntern);

      return await this.studentInternRepository.save(studentIntern);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async save(studentIntern: StudentIntern[]): Promise<StudentIntern[]> {
    return await this.studentInternRepository.save(studentIntern);
  }

  // delete(id: number) {
  //   return this.studentRepository.softDelete(id);
  // }
  async delete(student_id: number) {
    // get student_intern of student
    const studentIntern = await this.studentInternRepository.findOne({
      where: { student_id },
    });
    if (!studentIntern) {
      throw new HttpException('Student not found', 404);
    }
    // delete student from group
    // if (studentIntern.group_id) {
    //   await this.cancelGroup(student_id);
    // }
    return this.studentInternRepository.softDelete(studentIntern.id);
  }


  checkExistStudent(maso: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: { maso, deleted_at: null },
    });
  }

  async checkExistStudentIntern(
    student_id: number,
    semester_id: number,
  ): Promise<StudentIntern> {
    return this.studentInternRepository.findOne({
      where: { student_id, semester_id },
    });
  }

  async findOne(options): Promise<StudentIntern> {
    try {
      console.log('options', options);

      const student = await this.studentInternRepository.findOne({
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

  // async import(file, khoa_id): Promise<Student[]> {
  //   try {
  //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //     const workSheet = workbook.Sheets[workbook.SheetNames[0]];
  //     const data = XLSX.utils.sheet_to_json(workSheet);
  //     console.log('data ExpressExpressExpress', data);
  //     const students = await Promise.all(
  //       data.map(async (student: Student) => {
  //         const isExist = await this.checkExistStudent(student.maso);
  //         if (isExist) {
  //           console.log('Student already exists');
  //           return isExist;
  //         } else {
  //           const saltOrRounds = 10;
  //           const hash = await bcrypt.hash('12345678', saltOrRounds);
  //           student.matkhau = hash;
  //           student.khoa_id = khoa_id;
  //           console.log('user before create', student);

  //           return await this.studentRepository.save(student);
  //         }
  //       }),
  //     );
  //     // active semester
  //     console.log('studentsstudentsstudentsstudentsstudents', students);
  //     const currentSemester = await this.semesterService.getActiveSemester();
  //     const userIds = students.map((student) => student.id);
  //     console.log('idssssss', userIds, currentSemester);

  //     if (currentSemester) {
  //       await this.activeSemester(userIds, currentSemester.id);
  //     }

  //     return students;
  //   } catch (error) {
  //     console.log('error is_super_teacheris_super_teacher', error);

  //     throw new HttpException(error, 400);
  //   }
  // }

  async import(file, khoa_id) {
    try {
      const requiredHeaders = [
        'STT',
        'maso',
        'hodem',
        'ten',
        'ngay_sinh',
        'lop',
        'email',
      ];
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const headersRow = XLSX.utils.sheet_to_json(workSheet, { header: 1 })[0];
      if (JSON.stringify(headersRow) !== JSON.stringify(requiredHeaders)) {
        throw new HttpException('File không đúng định dạng', 400);
      }
      const rawData: ImportStudentDto[] = XLSX.utils.sheet_to_json(workSheet);
      const errors: any[] = [];
      const validUsers: ImportStudentDto[] = [];

      const currentSemester = await this.semesterService.getActiveSemester();
      for (const rawUser of rawData) {
        try {
          const userInstance = plainToInstance(ImportStudentDto, rawUser);

          // Validate using class-validator
          const validationErrors = await validate(userInstance);
          if (validationErrors.length > 0) {
            errors.push({
              ...rawUser,
              ngay_sinh: rawUser.ngay_sinh,
              error: validationErrors
                .map((err) => Object.values(err.constraints || {}))
                .flat()
                .join(', '),
            });
            continue;
          }

          // Check if sv already exists in semester intern
          const isExist = await this.checkExistStudent(userInstance.maso);
          console.log('user isExist', userInstance.ngay_sinh, isExist);
          if (isExist) {
            const studentIntern = await this.checkExistStudentIntern(
              isExist.id,
              currentSemester.id,
            );
            if (studentIntern) {
              errors.push({
                ...rawUser,
                ngay_sinh: rawUser.ngay_sinh,
                error: 'Sinh viên đã tồn tại',
              });
            } else {
              await this.activeSemester([isExist.id], currentSemester.id);
            }
            continue;
          }

          userInstance.matkhau = await bcrypt.hash('12345678', 10);

          userInstance.khoa_id = khoa_id;
          userInstance.ngay_sinh = new Date(
            format(userInstance.ngay_sinh, 'dd/MM/yyyy'),
          );
          console.log('userInstance', userInstance);

          validUsers.push(userInstance);
        } catch (error) {
          errors.push({ ...rawUser, error: error.message });
        }
      }

      const savedUsers = await Promise.all(
        validUsers.map(async (user) => {
          const st = await this.studentRepository.save(user);
          await this.activeSemester([st.id], currentSemester.id);
          return st;
        }),
      );

      if (errors.length > 0) {
        errors.sort((a, b) => a.STT - b.STT);
        const errorWorkbook = XLSX.utils.book_new();
        const errorSheet = XLSX.utils.json_to_sheet(errors);
        XLSX.utils.book_append_sheet(errorWorkbook, errorSheet, 'Errors');
        return XLSX.write(errorWorkbook, { bookType: 'xlsx', type: 'buffer' });
      }

      return { status: 'success', data: savedUsers };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  sendExcelFile(res: Response, buffer: Buffer, filename: string): void {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }
}
