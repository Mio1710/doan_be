import { InjectRepository } from '@nestjs/typeorm';
import { ReportTopicDto } from 'src/dtos';
import { ReportTopic, StudentTopic } from 'src/entities';
import { Repository } from 'typeorm';
import { StudentTopicService } from './student-topic.service';
import { SemesterService } from './semester.service';
import * as crypto from 'crypto';
// import { S3ClientUtil } from 'src/utils/s3-client.util';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { downloadFile, uploadFile } from 'src/utils/s3-client.util';

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export class ReportTopicService {
  constructor(
    @InjectRepository(ReportTopic)
    private readonly reportTopicRepository: Repository<ReportTopic>,
    private readonly studentTopicService: StudentTopicService,
    private readonly semesterService: SemesterService,
    // private readonly s3ClientUtils: S3ClientUtil,
  ) {}

  async create(reportTopic: ReportTopicDto): Promise<ReportTopic> {
    const studentTopic = await this.getStudentTopic(reportTopic.student_id);

    reportTopic.student_topic_id = studentTopic.id;
    reportTopic.file_key = `topic/${randomName()}`;
    reportTopic.file_name = reportTopic.file.originalname;
    await uploadFile(reportTopic, reportTopic.file_key);

    // delete reportTopic.student_id;
    return await this.reportTopicRepository.save(reportTopic);
  }

  async getLists(options): Promise<ReportTopic[]> {
    return await this.reportTopicRepository.find({ ...options });
  }

  async findOne(options): Promise<ReportTopic> {
    return await this.reportTopicRepository.findOne({ ...options });
  }

  async update(id: number, reportTopic: ReportTopicDto): Promise<ReportTopic> {
    return await this.reportTopicRepository.save(reportTopic);
  }

  async delete(id: number) {
    return await this.reportTopicRepository.softDelete(id);
  }

  async getStudentTopic(student_id: number): Promise<StudentTopic> {
    const activeSemester = await this.semesterService.getActiveSemester();
    return await this.studentTopicService.findOne({
      student_id,
      semester_id: activeSemester.id,
    });
  }

  async downloadFile(fileKey: string) {
    return await downloadFile(fileKey);
  }
}
