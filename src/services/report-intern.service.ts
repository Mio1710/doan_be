import { InjectRepository } from '@nestjs/typeorm';
import { ReportInternDto } from 'src/dtos';
import { ReportIntern, StudentIntern } from 'src/entities';
import { Repository, UpdateResult } from 'typeorm';
import { StudentInternService } from './student-intern.service';
import { SemesterService } from './semester.service';
import * as crypto from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { deleteFile, downloadFile, uploadFile } from 'src/utils/s3-client.util';
import { HttpException } from '@nestjs/common';

// const bucketName = process.env.BUCKET_NAME;
// const region = process.env.BUCKET_REGION;
// const accessKeyId = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;
// const s3Client = new S3Client({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey,
//   },
// });

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export class ReportInternService {
  constructor(
    @InjectRepository(ReportIntern)
    private readonly reportInternRepository: Repository<ReportIntern>,
    private readonly studentInternService: StudentInternService,
    private readonly semesterService: SemesterService,
    // private readonly s3ClientUtils: S3ClientUtil,
  ) {}

  // async create(reportIntern: ReportInternDto): Promise<ReportIntern> {
  //   const studentIntern = await this.getStudentIntern(reportIntern.student_id);

  //   reportIntern.student_intern_id = studentIntern.id;
  //   reportIntern.file_key = `intern/${randomName()}`;
  //   reportIntern.file_name = reportIntern.file.originalname;
  //   await uploadFile(reportIntern, reportIntern.file_key);

  //   // delete reportIntern.student_id;
  //   return await this.reportInternRepository.save(reportIntern);
  // }
  async create(reportIntern: ReportInternDto): Promise<ReportIntern> {
    try {
      const studentIntern = await this.getStudentIntern(reportIntern.student_id);
      // check if have report with week
      const checkReport = await this.reportInternRepository.findOne({
        where: { week: reportIntern.week, student_intern_id: studentIntern.id },
      });
      console.log('checkReport', checkReport);

      if (checkReport) {
        throw new HttpException(
          `Báo cáo tuần ${reportIntern.week} đã tồn tại`,
          400,
        );
      }

      reportIntern.student_intern_id = studentIntern.id;
      reportIntern.file_key = `topic/${randomName()}`;
      reportIntern.file_name = reportIntern.file.originalname;
      await uploadFile(reportIntern, reportIntern.file_key);

      return await this.reportInternRepository.save({
        week: reportIntern.week,
        file_key: reportIntern.file_key,
        file_name: reportIntern.file_name,
        description: reportIntern.description,
        student_intern_id: reportIntern.student_intern_id,
      });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  // async getLists(options): Promise<ReportIntern[]> {
  //   return await this.reportInternRepository.find({ ...options });
  // }
  async getLists(options): Promise<ReportIntern[]> {
    const studentId = options.student_id;
    const studentIntern = await this.getStudentIntern(studentId);
    return await this.reportInternRepository.find({
      where: { student_intern_id: studentIntern.id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(options): Promise<ReportIntern> {
    return await this.reportInternRepository.findOne({ ...options });
  }

  // async update(id: number, reportIntern: ReportInternDto): Promise<ReportIntern> {
  //   return await this.reportInternRepository.save(reportIntern);
  // }
  async update(id: number, reportIntern: ReportInternDto): Promise<UpdateResult> {
    const data = {};
    console.log('id', id);

    const currentReportIntern = await this.findOne({ where: { id } });
    if (reportIntern.file) {
      this.deleteFile(currentReportIntern.file_key);
      this.uploadFile(reportIntern);
      data['file_key'] = reportIntern.file_key;
      data['file_name'] = reportIntern.file_name;
    }
    data['week'] = reportIntern.week;
    data['description'] = reportIntern.description;

    return await this.reportInternRepository
      .createQueryBuilder()
      .update()
      .set(data)
      .where({ id })
      .execute();
  }


  async delete(id: number) {
    return await this.reportInternRepository.softDelete(id);
  }

  async getStudentIntern(student_id: number): Promise<StudentIntern> {
    const activeSemester = await this.semesterService.getActiveSemester();
    return await this.studentInternService.findOne({
      student_id,
      semester_id: activeSemester.id,
    });
  }

  async downloadFile(fileKey: string) {
    return await downloadFile(fileKey);
  }

  async uploadFile(reportIntern: ReportInternDto) {
    reportIntern.file_key = `topic/${randomName()}`;
    reportIntern.file_name = reportIntern.file.originalname;
    await uploadFile(reportIntern, reportIntern.file_key);
  }

  async deleteFile(fileKey: string) {
    return await deleteFile(fileKey);
  }
}
