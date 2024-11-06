import { HttpException, Injectable } from '@nestjs/common';
import { Student, User } from 'src/entities';
import { UserRepository } from 'src/repositories';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { CreateUserDTO, UpdateTeacherDto } from 'src/dtos';
import { SemesterService } from './semester.service';
import { StudentService } from './student.service';

// manage teacher/admin
// need exclude password field

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly semesterService: SemesterService,
    private readonly studentService: StudentService,
  ) {}

  getLists(options): Promise<User[]> {
    return this.userRepository.findAll(options);
  }

  async create(user: CreateUserDTO): Promise<User> {
    const isExist = await this.checkExistUser(user.maso);
    console.log('user before isExist', isExist, user.maso);
    if (isExist) {
      throw new HttpException('User already exists', 400);
    }
    console.log('user before create', user);

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(user.matkhau, saltOrRounds);
    user.matkhau = hash;
    return this.userRepository.create(user);
  }

  async update(user: UpdateTeacherDto): Promise<User> {
    try {
      return await this.userRepository.update(user);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async delete(id): Promise<User> {
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
    return this.userRepository.findOne({ maso });
  }

  async import(file, khoa_id: number): Promise<User[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(workSheet);
      console.log('data ExpressExpressExpress', data);
      const users = await Promise.all(
        data.map(async (user: User) => {
          const isExist = await this.checkExistUser(user.maso);
          if (isExist) {
            return;
          }

          user.roles = ['teacher'];
          if (user.is_super_teacher == 1) {
            user.roles.push('super_teacher');
          }
          if (user.is_admin == 1) {
            user.roles.push('admin');
          }

          const saltOrRounds = 10;
          const hash = await bcrypt.hash('12345678', saltOrRounds);
          user.matkhau = hash;
          console.log('user before create', user);
          // add khoa_id
          user.khoa_id = khoa_id;

          return await this.userRepository.create(user);
        }),
      );

      return users;
    } catch (error) {
      console.log('error is_super_teacheris_super_teacher', error);

      throw new HttpException(error, 400);
    }
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
        throw new HttpException('Current password is incorrect', 400);
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
}
