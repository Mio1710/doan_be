import { HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecommendTopicDto, RecommendTopicStatusDto } from 'src/dtos';
import { RecommendTopic } from 'src/entities';
import { Repository } from 'typeorm';

export class RecommendTopicService {
  constructor(
    @InjectRepository(RecommendTopic)
    private readonly recommendTopicRepository: Repository<RecommendTopic>,
  ) {}

  async getLists(options): Promise<RecommendTopic[]> {
    return await this.recommendTopicRepository.find({ ...options });
  }

  async create(recommendTopic): Promise<RecommendTopic> {
    return this.recommendTopicRepository.save(recommendTopic);
  }

  async update(id: number, recommendTopic: CreateRecommendTopicDto) {
    return await this.recommendTopicRepository.update(id, recommendTopic);
  }

  async updateStatus(id: number, data: RecommendTopicStatusDto) {
    return await this.recommendTopicRepository.update(id, {
      status: data.status,
      reject_reason: data.reject_reason,
    });
  }

  async delete(id: number): Promise<RecommendTopic[]> {
    const recommendTopic = await this.recommendTopicRepository.find({
      where: { id },
    });
    return await this.recommendTopicRepository.remove(recommendTopic);
  }

  async findOne(options): Promise<RecommendTopic> {
    try {
      console.log('options', options);

      const recommendTopic = await this.recommendTopicRepository.findOne({
        select: {
          id: true,
          ten: true,
          knowledge: true,
          description: true,
          status: true,
          reject_reason: true,
          teacher_id: true,
          teacher: {
            id: true,
            ten: true,
            hodem: true,
          },
        },
        where: { ...options },
        relations: ['teacher'],
      });
      console.log('recommendTopic', recommendTopic);

      return recommendTopic;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async getListByTeacher(teacher_id) {
    try {
      const recommendTopic = await this.recommendTopicRepository.find({
        where: { teacher_id },
        relations: ['student'],
      });

      return recommendTopic;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
