import { HttpException, Injectable } from '@nestjs/common';
import { Group, Student, StudentTopic } from 'src/entities';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SemesterService } from './semester.service';
import { parse } from 'date-fns';
import { ImportStudentDto } from 'src/dtos';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';

@Injectable()
export class StudentTopicService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(StudentTopic)
    private readonly studentTopicRepository: Repository<StudentTopic>,

    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    private readonly cls: ClsService,

    private readonly semesterService: SemesterService,
  ) {}

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
        studentTopic: {
          group_id: true,
          topic: {
            ten: true,
            teacher: {
              hodem: true,
              ten: true,
            },
          },
        },
      },
      where: {
        khoa_id,
        studentTopic: {
          status: 'new',
          semester: { id: semester.id },
        },
      },
      relations: {
        studentTopic: {
          topic: {
            teacher: true,
          },
        },
      },
    };
    console.log('options1111', options, params);

    return this.studentRepository.find({ ...options });
  }

  async find(options): Promise<StudentTopic[]> {
    return this.studentTopicRepository.find(options);
  }

  async create(student) {
    log('student before create', student);
    let user = await this.checkExistStudent(student.maso);
    const currentSemester = await this.semesterService.getActiveSemester();
    if (user) {
      console.log('Student already exists', user);
      // check if student already in semester
      const studentTopic = await this.checkExistStudentTopic(
        user.id,
        currentSemester.id,
      );
      if (studentTopic) {
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
    if (currentSemester) {
      await this.activeSemester([user.id], currentSemester.id);
    }

    return user;
  }

  async activeSemester(userIds: number[], semester_id: number) {
    console.log('in activeSemester', userIds, semester_id);

    userIds.map(async (student_id) => {
      const studentTopic = await this.studentTopicRepository.findOne({
        where: { student_id, semester_id },
      });
      if (!studentTopic) {
        await this.studentTopicRepository.save({
          student_id,
          semester_id,
        });
      }
    });
  }

  async update(studentId: number, data): Promise<StudentTopic> {
    try {
      const studentTopic = await this.findOne({ student_id: studentId });

      const getPartnerTopic = await this.studentTopicRepository.findOne({
        where: { student_id: data.partner_id },
      });
      studentTopic.topic_id = data.topic_id;
      if (data.partner_id) {
        const group = {
          firstPartner: { id: studentId },
          secondPartner: { id: getPartnerTopic.id },
        };
        const newGroup = await this.groupRepository.save(group);
        this.studentTopicRepository
          .createQueryBuilder()
          .update(StudentTopic)
          .set({ group_id: newGroup.id })
          .where('student_id IN (:...studentId)', {
            studentId: [studentId, data.partner_id],
          })
          .execute();
      }
      if (data.user_ids) {
        // cancel group
        await this.cancelGroup(studentId);
      }

      console.log('studentTopic11111', data, studentTopic);

      return await this.studentTopicRepository.save(studentTopic);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async save(studentTopic: StudentTopic[]): Promise<StudentTopic[]> {
    return await this.studentTopicRepository.save(studentTopic);
  }

  async delete(student_id: number) {
    // get student_topic of student
    const studentTopic = await this.studentTopicRepository.findOne({
      where: { student_id },
    });
    if (!studentTopic) {
      throw new HttpException('Student not found', 404);
    }
    // delete student from group
    if (studentTopic.group_id) {
      await this.cancelGroup(student_id);
    }
    return this.studentTopicRepository.softDelete(studentTopic.id);
  }

  async findOne(options): Promise<StudentTopic> {
    try {
      console.log('options', options);

      const student = await this.studentTopicRepository.findOne({
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

  async checkExistStudentTopic(
    student_id: number,
    semester_id: number,
  ): Promise<StudentTopic> {
    return this.studentTopicRepository.findOne({
      where: { student_id, semester_id },
    });
  }

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

          // Check if sv already exists in semester topic
          const isExist = await this.checkExistStudent(userInstance.maso);
          if (isExist) {
            const studentTopic = await this.checkExistStudentTopic(
              isExist.id,
              currentSemester.id,
            );
            if (studentTopic) {
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
          userInstance.ngay_sinh = parse(
            userInstance.ngay_sinh as unknown as string,
            'dd/MM/yyyy',
            new Date(),
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
  async getRegistedDetail(userId: number) {
    try {
      const activeSemester = await this.semesterService.getActiveSemester();
      const result = {
        topic: null,
        students: [],
        partner: null,
      };

      result.topic = await this.studentTopicRepository
        .createQueryBuilder('student_topics')
        .select([
          'student_topics.id',
          'student_topics.topic_id',
          'student_topics.semester_id',
          'student_topics.group_id',
          'topic',
          'teacher.ten',
          'teacher.hodem',
          'group.id',
          'group.first_partner_id',
          'group.second_partner_id',
        ])
        .leftJoin('student_topics.topic', 'topic')
        .leftJoin('topic.teacher', 'teacher')
        .leftJoin('student_topics.group', 'group')
        .where('student_topics.student_id = :student_id', {
          student_id: userId,
        })
        .andWhere('student_topics.semester_id = :semester_id', {
          semester_id: activeSemester.id,
        })
        .getOne();

      if (result.topic.id) {
        result.students = await this.studentRepository
          .createQueryBuilder('students')
          .select(['students', 'topic.group_id'])
          .leftJoin('students.studentTopic', 'topic')
          .leftJoin('topic.group', 'group')
          .where('topic.topic_id = :topic_id', {
            topic_id: result.topic.topic_id,
          })
          .andWhere('topic.semester_id = :semester_id', {
            semester_id: activeSemester.id,
          })
          .getMany();

        console.log('result', result.students);
        // get partner
        if (result.topic.group_id) {
          const partnerIds = [
            result.topic.group.first_partner_id,
            result.topic.group.second_partner_id,
          ];
          result.partner = await this.studentRepository
            .createQueryBuilder('students')
            .select([
              'students.id',
              'students.maso',
              'students.hodem',
              'students.ten',
              'students.lop',
            ])
            .where('id in (:...userIds)', { userIds: partnerIds })
            .getMany();
        }
      }
      return result;
    } catch (error) {
      console.log('error is_super_teacheris_super_teacher', error);

      throw new HttpException(error, 400);
    }
  }

  async cancelGroup(studentId: number) {
    // get group info
    const group = await this.getGroupByStudentId(studentId);

    if (!group || !group.first_partner_id || !group.second_partner_id) {
      throw new HttpException('Bad Request', 400);
    }
    const partnerId =
      group.first_partner_id === studentId
        ? group.second_partner_id
        : group.first_partner_id;

    console.log('partnerId', partnerId);

    // set second_partner_id = null for partner and set first_partner_id = partnerId
    await this.groupRepository
      .createQueryBuilder()
      .update(Group)
      .set({ firstPartner: { id: partnerId }, secondPartner: null })
      .where('id = :id', {
        id: group.id,
      })
      .execute();

    // set group_id = null for student excute cancel group
    await this.studentTopicRepository
      .createQueryBuilder()
      .update(StudentTopic)
      .set({ group_id: null })
      .where('student_id IN (:...studentId)', {
        studentId: [studentId, partnerId],
      })
      .execute();

    return true;
  }

  async createGroup(studentId: number, partnerId: number) {
    // check if student already in group
    const groupExist = await this.getGroupByStudentId(studentId);
    console.log('groupExistgroupExistgroupExist', groupExist, studentId);

    if (groupExist?.first_partner_id && groupExist?.second_partner_id) {
      throw new HttpException('Sinh viên đã có nhóm. Vui lòng thử lại', 400);
    }
    // check if partner already in group
    const groupExistPartner = await this.getGroupByStudentId(partnerId);
    if (
      groupExistPartner?.first_partner_id &&
      groupExistPartner?.second_partner_id
    ) {
      throw new HttpException('Sinh viên đã có nhóm. Vui lòng thử lại', 400);
    }
    const group: Group = groupExist || groupExistPartner || new Group();

    group.first_partner_id = studentId;
    group.second_partner_id = partnerId;

    const newGroup = await this.groupRepository.save(group);
    this.studentTopicRepository
      .createQueryBuilder()
      .update(StudentTopic)
      .set({ group_id: newGroup.id })
      .where('student_id IN (:...studentId)', {
        studentId: [studentId, partnerId],
      })
      .execute();

    return true;
  }

  async getGroupByStudentId(studentId: number) {
    return this.groupRepository
      .createQueryBuilder('group')
      .select(['group.id', 'group.first_partner_id', 'group.second_partner_id'])
      .where(
        'group.first_partner_id = :studentId or group.second_partner_id  = :studentId',
        { studentId },
      )
      .getOne();
  }
}
