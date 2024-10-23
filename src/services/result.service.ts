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
    if (!student_id) {
      throw new HttpException('Student id is required', 400);
    }
    const student_topic = await this.getStudentResult(student_id);

    try {
      const result = await this.LORepository.createQueryBuilder('lo')
        .leftJoinAndSelect(
          'lo_student_topics',
          'lst',
          'lo.id = lst.lo_id AND lst.student_topic_id = :studentTopicId',
          { studentTopicId: student_topic.id },
        )
        .select([
          'lo.id as lo_id',
          'lo.main_criteria as main_criteria',
          'lo.sub_criteria as sub_criteria',
          'lo.cof as cof',
          'lst.score as score',
          'lst.id as id',
          `${student_topic.id} as student_topic_id`,
        ])
        .orderBy('lo.id')
        .getRawMany();

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async updateStudentResultLO(listResult = []) {
    const studentId = listResult[0].student_topic_id;

    const dataCreate = listResult.filter((item) => !item.id && item.score);
    const dataUpdate = listResult.filter((item) => item.id && item.score);
    const dataDelete = listResult.filter((item) => item.id && !item.score);
    const dataDeleteId = dataDelete.map((item) => item.id);

    try {
      await this.loStudentTopicRepository
        .createQueryBuilder('lo_student_topics')
        .insert()
        .into(LOStudentTopic)
        .values(
          dataCreate.map((item) => ({
            student_topic: { id: studentId },
            lo: { id: item.lo_id },
            score: item.score,
          })),
        )
        .execute();

      dataUpdate.forEach(async (item) => {
        await this.loStudentTopicRepository
          .createQueryBuilder('lo_student_topics')
          .update(LOStudentTopic)
          .set({ score: item.score })
          .where('id = :id', { id: item.id })
          .execute();
      });

      if (dataDeleteId.length) {
        await this.loStudentTopicRepository
          .createQueryBuilder('lo_student_topics')
          .delete()
          .from(LOStudentTopic)
          .where('id IN (:...ids)', { ids: dataDeleteId })
          .execute();
      }
      return true;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
