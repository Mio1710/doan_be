import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Topic } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ListTopicQuery } from 'src/interfaces/queries/listTopic.interface';
import { SemesterService } from './semester.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,

    private readonly semesterService: SemesterService,
    private readonly cls: ClsService,
  ) {}

  async getLists(options?: ListTopicQuery): Promise<Topic[]> {
    let semester_id = options?.semester_id;
    if (!semester_id) {
      semester_id = await this.semesterService.getActiveSemester();
    }
    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.createdBy', 'user')
      .select(['topic', 'user.ten', 'user.hodem', 'user.id'])
      .where('topic.semester_id = :semester_id', { semester_id })
      .getMany();
  }

  async create(topic): Promise<Topic> {
    return this.topicRepository.save(topic);
  }

  async update(id: number, topic: Topic) {
    return await this.topicRepository.update(id, topic);
  }

  async delete(id: number): Promise<Topic[]> {
    const topic = await this.topicRepository.find({ where: { id } });
    return await this.topicRepository.remove(topic);
  }

  async findOne(options): Promise<Topic> {
    try {
      console.log('options', options);

      const topic = await this.topicRepository.findOne({
        where: { ...options },
      });

      return topic;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
  async checkTopic(id: number, status: string) {
    console.log('check id', id, status);

    const topic = await this.topicRepository.findOne({ where: { id } });
    if (topic.status === 'pending') {
      console.log('topic before', topic, status);
      topic.status = status;
      console.log('topic', topic);
      return await this.topicRepository.save(topic);
    } else {
      throw new HttpException('Topic is not pending', 400);
    }
  }

  async getRegistedDetail() {
    // const userId = this.cls.get('userId');

    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.studentSubjects', 'studentSubjects')
      .leftJoinAndSelect('studentSubjects.student', 'student')
      .select(['studentSubjects', 'student', 'topic'])
      .getOne();
  }

  async getListTopic(
    options?: ListTopicQuery,
    khoa_id?: number,
  ): Promise<Topic[]> {
    let semester = options?.semester_id;
    if (!semester) {
      semester = await this.semesterRepository
        .createQueryBuilder('semester')
        .select('semester.id')
        .where('semester.status = :status', { status: 'active' })
        .getRawOne();
    }
    console.log('semester_id', semester);
    const topics = await this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.khoa_id = :khoa_id', { khoa_id: khoa_id })
      .getMany();

    return topics;
  }
}
