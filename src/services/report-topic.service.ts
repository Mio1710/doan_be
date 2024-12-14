import { InjectRepository } from '@nestjs/typeorm';
import { ReportTopicDto } from 'src/dtos';
import { ReportTopic, StudentTopic } from 'src/entities';
import { Repository, UpdateResult } from 'typeorm';
import { StudentTopicService } from './student-topic.service';
import { SemesterService } from './semester.service';
import * as crypto from 'crypto';
import { deleteFile, downloadFile, uploadFile } from 'src/utils/s3-client.util';
import { HttpException } from '@nestjs/common';

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
    try {
      const studentTopic = await this.getStudentTopic(reportTopic.student_id);
      // check if have report with week
      const checkReport = await this.reportTopicRepository.findOne({
        where: { week: reportTopic.week, student_topic_id: studentTopic.id },
      });
      console.log('checkReport', checkReport);

      if (checkReport) {
        throw new HttpException(
          `Báo cáo tuần ${reportTopic.week} đã tồn tại`,
          400,
        );
      }

      reportTopic.student_topic_id = studentTopic.id;
      reportTopic.file_key = `topic/${randomName()}`;
      reportTopic.file_name = reportTopic.file.originalname;
      await uploadFile(reportTopic, reportTopic.file_key);

      return await this.reportTopicRepository.save({
        week: reportTopic.week,
        file_key: reportTopic.file_key,
        file_name: reportTopic.file_name,
        description: reportTopic.description,
        student_topic_id: reportTopic.student_topic_id,
      });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getLists(options): Promise<ReportTopic[]> {
    try {
      const studentId = options.student_id;
      const studentTopic = await this.getStudentTopic(studentId);
      return await this.reportTopicRepository.find({
        where: { student_topic_id: studentTopic.id },
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      console.log('error getLists', error);

      throw new HttpException('Bạn chưa đăng ký khóa luận', 400);
    }
  }

  async findOne(options): Promise<ReportTopic> {
    return await this.reportTopicRepository.findOne({ ...options });
  }

  async commentReportTopic(id: number, comment: string): Promise<UpdateResult> {
    return await this.reportTopicRepository
      .createQueryBuilder()
      .update()
      .set({ comment })
      .where({ id })
      .execute();
  }

  async update(id: number, reportTopic: ReportTopicDto): Promise<UpdateResult> {
    const data = {};
    console.log('id', id);

    const currentReportTopic = await this.findOne({ where: { id } });
    if (reportTopic.file) {
      this.deleteFile(currentReportTopic.file_key);
      this.uploadFile(reportTopic);
      data['file_key'] = reportTopic.file_key;
      data['file_name'] = reportTopic.file_name;
    }
    data['week'] = reportTopic.week;
    data['description'] = reportTopic.description;

    return await this.reportTopicRepository
      .createQueryBuilder()
      .update()
      .set(data)
      .where({ id })
      .execute();
  }

  async delete(id: number) {
    return await this.reportTopicRepository.softDelete(id);
  }

  async getStudentTopic(student_id: number): Promise<StudentTopic> {
    const activeSemester = await this.semesterService.getActiveSemester();
    console.log('check student topic', student_id);

    return await this.studentTopicService.findOne({
      student_id,
      semester_id: activeSemester.id,
    });
  }

  async downloadFile(fileKey: string) {
    return await downloadFile(fileKey);
  }
  async uploadFile(reportTopic: ReportTopicDto) {
    reportTopic.file_key = `topic/${randomName()}`;
    reportTopic.file_name = reportTopic.file.originalname;
    await uploadFile(reportTopic, reportTopic.file_key);
  }

  async deleteFile(fileKey: string) {
    return await deleteFile(fileKey);
  }

  // check if student have not create group
  async checkStudentGroup(studentId: number): Promise<boolean> {
    try {
      const currentSemester = await this.semesterService.getActiveSemester();
      const studentTopic = await this.studentTopicService.findOne({
        student_id: studentId,
        semester_id: currentSemester.id,
      });
      if (studentTopic.group_id) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}
