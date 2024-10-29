import { HttpException, Injectable } from '@nestjs/common';
import { Student } from '../entities/student.entity';
import { StudentIntern } from '../entities/student-intern.entity';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SemesterService } from './semester.service';

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
  //       // studentIntern: {
  //       //   intern_staus: true,
  //       // },
  //     },
  //     where: {
  //       khoa_id,
  //       studentIntern: {
  //         status: 'new',
  //         semester: { id: semester.id },
  //       },
  //     },
  //     relations: ['studentIntern'],
  //   };
  //   console.log('options1111', options, params);

  //   return this.studentRepository.find({ ...options });
  // }

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
  //       studentTopic: {
  //         group_id: true,
  //         topic: {
  //           ten: true,
  //           teacher: {
  //             hodem: true,
  //             ten: true,
  //           },
  //         },
  //       },
  //     },
  //     where: {
  //       khoa_id,
  //       studentTopic: {
  //         status: 'new',
  //         semester: { id: semester.id },
  //       },
  //     },
  //     relations: {
  //       studentTopic: {
  //         topic: {
  //           teacher: true,
  //         },
  //       },
  //     },
  //   };
  //   console.log('options1111', options, params);

  //   return this.studentRepository.find({ ...options });
  // }
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
            // studentIntern:  {
            //   intern_staus: true,
            // }     
          },
        where: {
            khoa_id,
            studentIntern: {
              intern_status: 'new',
              semester: { id: semester.id },
            },
        },
        relations: ['studentIntern'],
    };

    console.log('options1111', options, params);

    return this.studentRepository.find({ ...options });
  }
  
  async find(options): Promise<StudentIntern[]> {
    return this.studentInternRepository.find(options);
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

    return await this.studentInternRepository
      .createQueryBuilder()
      .insert()
      .into(StudentIntern)
      .values(
        userIds.map((student_id) => ({
          student_id,
          semester_id,
        })),
      )
      .orUpdate(['status'], ['student_id', 'semester_id'])
      .execute();
  }

  async update(studentId: number, data): Promise<StudentIntern> {
    try {
      const studentIntern = await this.findOne({ student_id: studentId });

    //   const getPartnerTopic = await this.studentInternRepository.findOne({
    //     where: { student_id: data.partner_id },
    //   });
    //   studentIntern.topic_id = data.topic_id;
    //   if (data.partner_id) {
    //     const group = {
    //       firstPartner: { id: studentId },
    //       secondPartner: { id: getPartnerTopic.id },
    //     };
    //     // const newGroup = await this.groupRepository.save(group);
    //     this.studentInternRepository
    //       .createQueryBuilder()
    //       .update(StudentIntern)
    //       .set({ group_id: newGroup.id })
    //       .where('student_id IN (:...studentId)', {
    //         studentId: [studentId, data.partner_id],
    //       })
    //       .execute();
    //   }
    //   if (data.user_ids) {
    //     // cancel group
    //     await this.cancelGroup(studentId);
    //   }

      console.log('studentIntern11111', data, studentIntern);

      return await this.studentInternRepository.save(studentIntern);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async save(studentIntern: StudentIntern[]): Promise<StudentIntern[]> {
    return await this.studentInternRepository.save(studentIntern);
  }

  delete(id: number) {
    return this.studentRepository.softDelete(id);
  }

  checkExistStudent(maso: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: { maso, deleted_at: null },
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

}