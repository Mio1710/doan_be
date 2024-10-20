import { HttpException, Injectable } from '@nestjs/common';
import { LO, StudentTopic } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LOStudentTopic } from 'src/entities/lo-student-topic.entity';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(LO)
    private readonly LORepository: Repository<LO>,

    @InjectRepository(StudentTopic)
    private readonly studentTopicRepository: Repository<StudentTopic>,

    @InjectRepository(LOStudentTopic)
    private readonly loStudentTopicRepository: Repository<LOStudentTopic>,
  ) {}

  async getStudentResult(student_id) {
    try {
      const studentTopic = await this.studentTopicRepository.findOne({
        select: {
          id: true,
          group_id: true,
          topic: {
            ten: true,
            teacher: {
              ten: true,
              hodem: true,
            },
          },
          student: {
            ten: true,
            hodem: true,
            lop: true,
            maso: true,
          },
        },
        where: { student_id },
        relations: {
          topic: {
            teacher: true,
          },
          student: true,
        },
      });

      return studentTopic;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async updateScore(student_id, data) {
    const result = await this.loStudentTopicRepository
      .createQueryBuilder('lo_student_topics')
      .insert()
      .into(LOStudentTopic)
      .values(
        data.map((item) => ({
          student_topic: { id: student_id },
          lo: { id: item.lo_id },
          score: item.score,
        })),
      )
      .orUpdate({
        conflict_target: ['student_topic_id', 'lo_id'],
        overwrite: ['score'],
      })
      .execute();
    return result;
  }

  async getStudentResultLO(student_id) {
    console.log('student_id1111', student_id);

    try {
      const result = await this.LORepository.createQueryBuilder('lo')
        .leftJoinAndSelect('lo.loStudentTopic', 'loStudentTopic')
        .where('loStudentTopic.student_topic_id = :student_id', { student_id })
        .select(['lo.id', 'lo.main_criteria', 'loStudentTopic.score'])
        .getMany();

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
