import { HttpException, Injectable } from '@nestjs/common';
import { Topic } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,

    private readonly cls: ClsService,
  ) {}

  async getLists(): Promise<Topic[]> {
    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.createdBy', 'user')
      .select(['topic', 'user.ten', 'user.hodem', 'user.id'])
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
}
