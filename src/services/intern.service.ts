import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Intern } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ListInternQuery } from 'src/interfaces/queries/listIntern.interface';
import { SemesterService } from './semester.service';

@Injectable()
export class InternService {
  constructor(
    @InjectRepository(Intern)
    private readonly internRepository: Repository<Intern>,

    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,

    // @InjectRepository(TopicSemester)
    // private readonly topicSemesterRepository: Repository<TopicSemester>,

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
    const query = this.internRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.student_intern', 'student_intern')
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
        'student_intern.ten',
        'student_intern.hodem',
        'student_intern.id',
      ]);

    // const query = this.internRepository
    //   .createQueryBuilder('intern')
    //   .leftJoinAndSelect('intern.teacher', 'user')
    //   .leftJoinAndSelect('intern.khoa', 'khoa')
    //   .leftJoinAndSelect('intern.semesters', 'semester')
    //   .select([
    //     'intern.company_name',
    //     'intern.address',
    //     'intern.company_phone',
    //     'intern.company_email',
    //     'intern.status',
    //     'user.ten',
    //     'user.hodem',
    //     'user.id',
    //   ]);

    // add condition
    query
      .where('semester.semester_id = :semester_id', { semester_id })
      .andWhere('intern.khoa_id = :khoa_id', { khoa_id });

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
    const data = await this.internRepository.save(intern);

    console.log('intern data create', data);

    // active semester
    const currentSemester = await this.semesterService.getActiveSemester();

    // const topicSemester = await this.topicSemesterRepository.save({
    //   topic_id: data.id,
    //   semester_id: currentSemester.id,
    // });

    // console.log('topicSemester', topicSemester);

    return data;
  }

  async update(id: number, intern: Intern) {
    return await this.internRepository.update(id, intern);
  }

  async delete(id: number): Promise<Intern[]> {
    const intern = await this.internRepository.find({ where: { id } });
    return await this.internRepository.remove(intern);
  }

  async findOne(options): Promise<Intern> {
    try {
      console.log('options', options);

      const intern = await this.internRepository.findOne({
        where: { ...options },
      });

      return intern;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
  async checkIntern(id: number, status: string) {
    console.log('check id', id, status);

    const intern = await this.internRepository.findOne({ where: { id } });
    if (intern.status === 'pending') {
      console.log('intern before', intern, status);
      intern.status = status;
      console.log('intern', intern);
      return await this.internRepository.save(intern);
    } else {
      throw new HttpException('Intern is not pending', 400);
    }
  }

  async getRegistedDetail() {
    // const userId = this.cls.get('userId');

    return await this.internRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.studentSubjects', 'studentSubjects')
      .leftJoinAndSelect('studentSubjects.student', 'student')
      .select(['studentSubjects', 'student', 'intern'])
      .getOne();
  }

  async getListIntern(
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
    const interns = await this.internRepository
      .createQueryBuilder('intern')
      .where('intern.khoa_id = :khoa_id', { khoa_id: khoa_id })
      .getMany();

    return interns;
  }

  async resetIntern(khoa_id: number) {
    // get all current interns
    const interns = await this.internRepository.find({ where: { khoa_id } });

    // soft delete all intern of khoa
    await this.internRepository
      .createQueryBuilder()
      .softDelete()
      .from(Intern)
      .where('khoa_id = :khoa_id', { khoa_id })
      .andWhere('deleted_at IS NULL')
      .execute();

    // create new interns
    await this.internRepository
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
        })),
      )
      .execute();

  }
}
