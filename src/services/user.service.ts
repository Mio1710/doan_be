import { HttpException, Injectable } from '@nestjs/common';
import { Student, User } from 'src/entities';
import { UserRepository } from 'src/repositories';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { CreateUserDTO, ImportUserDto, UpdateTeacherDto } from 'src/dtos';
import { SemesterService } from './semester.service';
import { StudentService } from './student.service';
import { UpdateResult } from 'typeorm';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { format, parse } from 'date-fns';

// manage teacher/admin
// need exclude password field

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly semesterService: SemesterService,
    private readonly studentService: StudentService,
  ) {}

  async getLists(options): Promise<User[]> {
    console.log('options query', options.query.query);

    const findQuery = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.maso',
        'user.hodem',
        'user.ten',
        'user.email',
        'user.ngay_sinh',
        'user.roles',
        'user.khoa_id',
        'user.deleted_at',
      ]);
    const { khoa_id, query } = options.query;
    if (khoa_id) {
      findQuery.andWhere('khoa_id = :khoa_id', { khoa_id });
    }
    if (query?.filter?.q) {
      findQuery.andWhere(
        'maso like :query or hodem like :query or ten like :query',
        { query: `%${query.filter.q}%` },
      );
    }
    return findQuery.getMany();
  }

  getListss(options): Promise<User[]> {
    return this.userRepository.findAll(options);
  }

  async create(user: CreateUserDTO): Promise<User> {
    const isExist = await this.checkExistUser(user.maso);
    console.log('user before isExist', user.maso, isExist);
    if (isExist) {
      throw new HttpException('User already exists', 400);
    }
    console.log('user before create', user);

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(user.matkhau, saltOrRounds);
    user.matkhau = hash;
    console.log('user.ngay_sinh', user, user.ngay_sinh);
    if (user.ngay_sinh) {
      console.log('user.ngay_sinh start', user.ngay_sinh);
      user.ngay_sinh = parse(
        user.ngay_sinh.toString(),
        'dd/MM/yyyy',
        new Date(),
      );
      console.log('user.ngay_sinh', user.ngay_sinh);
    }
    return this.userRepository.create(user);
  }

  async update(user: UpdateTeacherDto): Promise<User> {
    try {
      if (user.ngay_sinh) {
        console.log('user.ngay_sinh start', user.ngay_sinh);
        user.ngay_sinh = parse(
          user.ngay_sinh.toString(),
          'dd/MM/yyyy',
          new Date(),
        );
      }
      return await this.userRepository.update(user);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async delete(id): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.findOne(id);
      console.log('user', user);

      return await this.userRepository.delete(user);
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async findOne(options): Promise<User> {
    try {
      console.log('options', options);

      const user = await this.userRepository.findOne(options);
      console.log('check user findone', user);

      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return user;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  checkExistUser(maso: string): Promise<User> {
    if (!maso) {
      return null;
    }
    return this.userRepository.findOne({ maso });
  }

  async import(file, khoa_id: number) {
    try {
      const requiredHeaders = [
        'STT',
        'maso',
        'hodem',
        'ten',
        'email',
        'ngay_sinh',
        'is_admin',
        'is_super_teacher',
      ];

      const workbook = XLSX.read(file.buffer, {
        type: 'buffer',
      });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Validate headers
      const headersRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      console.log('Headers:', headersRow);
      if (JSON.stringify(headersRow) !== JSON.stringify(requiredHeaders)) {
        throw new HttpException('File không đúng định dạng', 400);
      }

      const rawData: ImportUserDto[] = XLSX.utils.sheet_to_json(worksheet);
      const errors: any[] = [];
      const validUsers: ImportUserDto[] = [];

      for (const rawUser of rawData) {
        try {
          const userInstance = plainToInstance(ImportUserDto, rawUser);

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

          // Check if user already exists
          const isExist = await this.checkExistUser(userInstance.maso);
          console.log('user isExist', userInstance.ngay_sinh, isExist);
          if (isExist) {
            errors.push({
              ...rawUser,
              ngay_sinh: rawUser.ngay_sinh,
              error: 'Người dùng đã tồn tại',
            });
            continue;
          }

          // Process user fields
          userInstance.roles = ['teacher'];
          if (userInstance.is_super_teacher === 1)
            userInstance.roles.push('super_teacher');
          if (userInstance.is_admin === 1) userInstance.roles.push('admin');

          userInstance.matkhau = await bcrypt.hash('12345678', 10);

          userInstance.khoa_id = khoa_id;
          userInstance.ngay_sinh = new Date(
            format(userInstance.ngay_sinh, 'dd/MM/yyyy'),
          );
          console.log('userInstance', userInstance);

          validUsers.push(userInstance);
        } catch (error) {
          console.error('Error processing user:', rawUser.maso, error.message);
          errors.push({ ...rawUser, error: error.message });
        }
      }

      // Save valid users to database
      console.log('Valid users:', validUsers);

      const savedUsers = await Promise.all(
        validUsers.map((user) => this.userRepository.create(user)),
      );

      // Write errors to Excel file if any
      if (errors.length > 0) {
        errors.sort((a, b) => a.STT - b.STT);
        const errorWorkbook = XLSX.utils.book_new();
        const errorSheet = XLSX.utils.json_to_sheet(errors);
        XLSX.utils.book_append_sheet(errorWorkbook, errorSheet, 'Errors');
        return XLSX.write(errorWorkbook, { bookType: 'xlsx', type: 'buffer' });
      }

      return { status: 'success', data: savedUsers };
    } catch (error) {
      console.error('Import error:', error);
      throw new HttpException(error.message || 'Import failed', 400);
    }
  }

  private _convertExcelDate(excelDate: number): Date | null {
    if (!excelDate || typeof excelDate !== 'number') return null;
    const date = new Date(Date.UTC(1900, 0, excelDate - 1)); // Convert Excel serial to JS Date
    return date;
  }

  sendExcelFile(res: Response, buffer: Buffer, filename: string): void {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  async updateRole(id, role: string[]): Promise<User> {
    try {
      // const options = { where: { id } };
      const user = await this.userRepository.findOne(id);
      console.log('user find one nè', user, user.roles, role);

      user.roles = role;
      return await this.userRepository.update(user);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getStudentTopic(teacher_id: number): Promise<Student[]> {
    try {
      const activeSemester = await this.semesterService.getActiveSemester();
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
            id: true,
            group_id: true,
            topic: {
              ten: true,
            },
          },
        },
        where: {
          studentTopic: {
            semester_id: activeSemester.id,
            topic: {
              teacher: { id: teacher_id },
            },
          },
        },
        relations: {
          studentTopic: {
            topic: true,
          },
        },
      };
      return await this.studentService.getLists(options);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async updatePassword(userId, body): Promise<User> {
    try {
      const user = await this.findOne({ id: userId });
      console.log('user usersService', user);

      const oldPass = body.old_password;
      const newPassword = body.new_password;

      // check if the current password is correct
      const isMatch = await bcrypt.compare(oldPass, user.matkhau);
      if (!isMatch) {
        throw new HttpException('Mật khẩu hiện tại không đúng', 400);
      }

      // check new password is same old password
      const isSame = await bcrypt.compare(newPassword, user.matkhau);
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
      user.matkhau = hash;
      await this.update(user);
      return;
    } catch (error) {
      throw new HttpException(error.message, error.code ?? 400);
    }
  }

  async resetPassword(id: number): Promise<User> {
    try {
      const user = await this.findOne({ id });
      const saltOrRounds = 10;
      const hash = await bcrypt.hash('12345678', saltOrRounds);
      user.matkhau = hash;
      return await this.update(user);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
