import { TeacherGroupCreateDto } from 'src/dtos/teacher-group.dto';
import { TeacherGroup, TeacherGroupMember, User } from 'src/entities';
import { Repository } from 'typeorm';
import { SemesterService } from './semester.service';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeacherGroupSerivce {
  constructor(
    @InjectRepository(TeacherGroup)
    private readonly teacherGroupRepository: Repository<TeacherGroup>,

    @InjectRepository(TeacherGroupMember)
    private readonly teacherGroupMemberRepository: Repository<TeacherGroupMember>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly semesterService: SemesterService,
  ) {}

  async create(
    teacherGroup: TeacherGroupCreateDto,
    faculty: number,
  ): Promise<TeacherGroup> {
    const getListTeacherValid = await this.userRepository.findByIds(
      teacherGroup.teacher_ids,
    );
    const activeSemester = await this.semesterService.getActiveSemester();

    const newGroup = new TeacherGroup();
    newGroup.semester = activeSemester;
    newGroup.faculty_id = faculty;
    newGroup.name = teacherGroup.name;
    const group = await this.teacherGroupRepository.save(newGroup);
    await this.teacherGroupMemberRepository
      .createQueryBuilder('teacher_group_members')
      .insert()
      .into(TeacherGroupMember)
      .values(
        getListTeacherValid.map((teacher) => ({
          teacher: { id: teacher.id },
          teacher_group: { id: group.id },
        })),
      )
      .execute();

    return group;
  }

  async getListGroups(options, faculty: number): Promise<TeacherGroup[]> {
    const activeSemester = await this.semesterService.getActiveSemester();
    let semester_id = activeSemester.id;
    if (options.semester_id) {
      semester_id = options.semester_id;
    }
    return await this.teacherGroupRepository.find({
      select: {
        id: true,
        name: true,
        teachers: {
          id: true,
          teacher_id: true,
          teacher: {
            id: true,
            ten: true,
            hodem: true,
            email: true,
            maso: true,
          },
        },
      },
      where: {
        semester: { id: semester_id },
        faculty: { id: faculty },
      },
      relations: {
        teachers: {
          teacher: true,
        },
      },
    });
  }

  async getOne(id: number): Promise<TeacherGroup[]> {
    return await this.teacherGroupRepository.find({
      where: { id },
      relations: ['teachers'],
    });
  }

  async update(id: number, data: TeacherGroupCreateDto) {
    // delete all teacher in group
    await this.teacherGroupMemberRepository.delete({ teacher_group: { id } });

    // insert new teacher
    const getListTeacherValid = await this.userRepository.findByIds(
      data.teacher_ids,
    );

    await this.teacherGroupMemberRepository
      .createQueryBuilder('teacher_group_members')
      .insert()
      .into(TeacherGroupMember)
      .values(
        getListTeacherValid.map((teacher) => ({
          teacher: { id: teacher.id },
          teacher_group: { id },
        })),
      )
      .execute();

    return true;
  }

  async delete(id: number): Promise<TeacherGroup[]> {
    try {
      const group = await this.teacherGroupRepository.find({ where: { id } });
      await this.teacherGroupMemberRepository.delete({ teacher_group: { id } });
      await this.teacherGroupRepository.delete({ id });
      return group;
    } catch (error) {
      throw new HttpException(
        'Không được xóa nhóm giảng viên này. Vui lòng kiểm tra lại!',
        400,
      );
    }
  }
}
