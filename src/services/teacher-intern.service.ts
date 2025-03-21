import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Intern } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ListInternQuery } from 'src/interfaces/queries/listIntern.interface';
import { SemesterService } from './semester.service';
import { InternSemester } from '../entities';
import { CreateInternDto } from 'src/dtos/intern.dto';
import { User } from '../entities/user.entity';
// import { UserService } from './user.service';
@Injectable()
export class TeacherInternService {
  constructor(
    @InjectRepository(Intern)
    private readonly teacherInternRepository: Repository<Intern>,

    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,

    @InjectRepository(InternSemester)
    private readonly internSemesterRepository: Repository<InternSemester>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // private readonly userService: UserService,

    private readonly semesterService: SemesterService,
    private readonly cls: ClsService,
  ) {}


  async getLists(options?: ListInternQuery): Promise<Intern[]> {
    let semester_id = options?.semester_id;
    const khoa_id = options?.khoa_id;
    const viewAll = options?.viewAll ?? false;
    const userID = this.cls.get('userId');
    if (!semester_id) {
      const semester = await this.semesterService.getActiveSemester();
      semester_id = semester.id;
    }
    console.log('semester_id', semester_id, khoa_id, options, viewAll);

    // select information
    const query = this.teacherInternRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.student', 'student')
      .leftJoinAndSelect('intern.teacher', 'user')
      .leftJoinAndSelect('intern.khoa', 'khoa')
      .leftJoinAndSelect('intern.semesters', 'semester')
      .select([
        'intern.company_name',
        'intern.address',
        'intern.company_phone',
        'intern.company_email',
        'intern.supervisor_name',
        'intern.supervisor_phone',
        'intern.supervisor_email',
        'intern.status',
        'intern.score',
        'intern.id',
        'student.ten',
        'student.hodem',
        'student.id',
        'student.maso',
        'user.id',
        'user.hodem',
        'user.ten'
      ]);

    // add condition
    query
      .where('semester.semester_id = :semester_id', { semester_id })
      .andWhere('intern.khoa_id = :khoa_id', { khoa_id });

     //Lấy danh sách thực tập theo giảng viên được đăng ký
    query.andWhere('intern.teacher_id = :userID', { userID });

    if (!viewAll) {
      query.andWhere('intern.created_by = :userID', { userID });
    }
    if (options?.status) {
      query.andWhere('intern.status IN (:...status)', {
        status: options.status,
      });
    }

    return await query.getMany();
  }

  async create(intern): Promise<Intern> {
    console.log('intern before create', intern);
    const data = await this.teacherInternRepository.save(intern);
    console.log('intern data create', data);

    // active semester
    const currentSemester = await this.semesterService.getActiveSemester();

    const internSemester = await this.internSemesterRepository.save({
      intern_id: data.id,
      semester_id: currentSemester.id,
    });

    console.log('internSemester', internSemester);

    return data;
  }

  async update(id: number, intern: Intern) {
    return await this.teacherInternRepository.update(id, intern);
  }

  async delete(id: number): Promise<Intern[]> {
    const intern = await this.teacherInternRepository.find({ where: { id } });
    return await this.teacherInternRepository.remove(intern);
  }

  async findOne(options): Promise<Intern> {
    try {
      console.log('options', options);

      const intern = await this.teacherInternRepository.findOne({
        where: { ...options },
      });

      return intern;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
  async checkTeacherIntern(id: number, status: string) {
    console.log('check id', id, status);

    const intern = await this.teacherInternRepository.findOne({ where: { id } });
    if (intern.status === 'pending') {
      console.log('intern before', intern, status);
      intern.status = status;
      console.log('intern', intern);
      return await this.teacherInternRepository.save(intern);
    } else {
      throw new HttpException('Intern is not pending', 400);
    }
  }

  async getRegistedDetail() {
    // const userId = this.cls.get('userId');

    return await this.teacherInternRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.studentSubjects', 'studentSubjects')
      .leftJoinAndSelect('studentSubjects.student', 'student')
      .select(['studentSubjects', 'student', 'intern'])
      .getOne();
  }

  async getListTeacherIntern(
    options?: ListInternQuery,
    khoa_id?: number,
  ): Promise<Intern[]> {
    let semester = options?.semester_id;
    if (!semester) {
      semester = await this.semesterRepository
        .createQueryBuilder('semester')
        .select('semester.id')
        .where('semester.status = :status', { status: 'active' })
        .getRawOne();
    }
    console.log('semester_id', semester);
    const interns = await this.teacherInternRepository
      .createQueryBuilder('intern')
      .where('intern.khoa_id = :khoa_id', { khoa_id: khoa_id })
      .getMany();

    return interns;
  }

  async resetIntern(khoa_id: number) {
    // get all current interns
    const interns = await this.teacherInternRepository.find({ where: { khoa_id } });

    // soft delete all intern of khoa
    await this.teacherInternRepository
      .createQueryBuilder()
      .softDelete()
      .from(Intern)
      .where('khoa_id = :khoa_id', { khoa_id })
      .andWhere('deleted_at IS NULL')
      .execute();

    // create new interns
    await this.teacherInternRepository
      .createQueryBuilder()
      .insert()
      .into(Intern, [
        'company_name',
        'address',
        'company_phone',
        'company_email',
        'supervisor_name',
        'supervisor_phone',
        'supervisor_email',
        'score',
        'status',
        'khoa_id',
        'created_by',
        'teacher_id',
        'student_intern_id',
      ])
      .values(
        interns.map((intern) => ({
          company_name: intern.company_name,
          address: intern.address,
          company_phone: intern.company_phone,
          company_email: intern.company_email,
          supervisor_name: intern.supervisor_name,
          supervisor_phone: intern.supervisor_phone,
          supervisor_email: intern.supervisor_email,
          status: 'pending',
          khoa_id,
          created_by: intern.created_by,
          teacher_id: intern.teacher_id,
          student_intern_id: intern.student_intern_id,
        })),
      )
      .execute();

    // add intern semester
    const currentSemester = await this.semesterService.getActiveSemester();
    const newInterns = await this.teacherInternRepository.find({ where: { khoa_id } });
    return await this.internSemesterRepository
      .createQueryBuilder()
      .insert()
      .into(InternSemester, ['semester_id', 'intern_id'])
      .values(
        newInterns.map((intern) => ({
          semester_id: currentSemester.id,
          intern_id: intern.id,
        })),
      )
      .execute();

  }
}
