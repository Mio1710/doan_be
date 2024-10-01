import { HttpException, Injectable } from '@nestjs/common';
import { Semester, Topic, TopicSemester } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptions, Repository } from 'typeorm';
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

    @InjectRepository(TopicSemester)
    private readonly topicSemesterRepository: Repository<TopicSemester>,

    private readonly semesterService: SemesterService,
    private readonly cls: ClsService,
  ) {}

  async getLists(options?: ListTopicQuery): Promise<Topic[]> {
    let semester_id = options?.semester_id;
    const khoa_id = options?.khoa_id;
    const viewAll = options?.viewAll ?? false;
    const userID = this.cls.get('userId');
    if (!semester_id) {
      semester_id = await this.semesterService.getActiveSemester();
    }
    console.log('semester_id', semester_id, khoa_id, options, viewAll);

    // select information
    const query = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.createdBy', 'user')
      .leftJoinAndSelect('topic.khoa', 'khoa')
      .leftJoinAndSelect('topic.semesters', 'semester')
      .select([
        'topic.ten',
        'topic.description',
        'topic.requirement',
        'topic.knowledge',
        'topic.status',
        'topic.id',
        'user.ten',
        'user.hodem',
        'user.id',
      ]);

    // add condition
    query
      .where('semester.id = :semester_id', { semester_id })
      .andWhere('topic.khoa_id = :khoa_id', { khoa_id });

    if (!viewAll) {
      query.andWhere('topic.created_by = :userID', { userID });
    }

    return await query.getMany();
  }

  async create(topic): Promise<Topic> {
    const data = await this.topicRepository.save(topic);

    // active semester
    const currentSemester = await this.semesterService.getActiveSemester();

    const topicSemester = await this.topicSemesterRepository.save({
      topic_id: data.id,
      semester_id: currentSemester,
    });

    console.log('topicSemester', topicSemester);

    return data;
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
