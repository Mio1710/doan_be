import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Intern } from '../entities';
import { ListInternQuery } from 'src/interfaces/queries/listIntern.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { SemesterService } from './semester.service';
import { asap } from 'rxjs';

@Injectable()
export class InternService {
  constructor(
    @InjectRepository(Intern)
    private readonly internRespository: Repository<Intern>,

    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,

    private readonly semesterService: SemesterService,
    private readonly cls: ClsService,
  ) {}

// getLists intern
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
    const query = this.internRespository
        .createQueryBuilder('intern')
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
        'user.ten',
        'user.hodem',
        'user.id',
        ]);
    
    // add condition
    query
        .where('semester.semester_id = :semester_id', { semester_id })
        .andWhere('intern.khoa_id = :khoa_id', { khoa_id });
    
    if (!viewAll) {
        query.andWhere('intern.created_by = :userID', { userID });
    }
    return query.getMany();
}

async create(intern): Promise<Intern> {
    console.log('intern before create', intern);
    const data = await this.internRespository.save(intern);

    console.log('intern after create', data);

    const currentSemester = await this.semesterService.getActiveSemester();

    return data;
    
}

async update(id: number, intern: Intern) {
    return await this.internRespository.update(id, intern);
}

async delete(id: number): Promise<Intern[]> {
    const intern = await this.internRespository.find({ where: { id } });
    return await this.internRespository.remove(intern);
}

async findOne(options): Promise<Intern> {
    try {
        console.log('options', options);

        const intern = await this.internRespository.findOne({
        where: { ...options },
        });

        return intern;
    } catch (error) {
        throw new HttpException(error, 400);
    }
}

async checkIntern(id: number, status: string) {
    console.log('checkIntern', id, status);

    const intern = await this.internRespository.findOne({ where: { id } });
    if (intern.status === 'register') {
        console.log('intern before', intern, status);
        intern.status = status;
        console.log('intern after', intern);
        return await this.internRespository.save(intern);
    }
    else {
        throw new HttpException('Unapproved internship', 400);
    }
}

async getListIntern(
    options?: ListInternQuery,
    khoa_id?: number,
): Promise<Intern[]> {
    let semester = options?.semester_id;
    if (!semester)
    {
        semester = await this.semesterRepository
        .createQueryBuilder('semester')
        .select('semester.id')
        .where('semester.status = :status', { status: 'active' })
        .getRawOne();
    }

    console.log('semester_id', semester);
    const interns = await this.internRespository
      .createQueryBuilder('intern')
      .where('intern.khoa_id = :khoa_id', { khoa_id: khoa_id })
      .getMany();

    return interns;
}    

}
