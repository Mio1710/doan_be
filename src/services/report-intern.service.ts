import { InjectRepository } from '@nestjs/typeorm';
import { ReportInternDto } from 'src/dtos';
import { ReportIntern, StudentIntern } from 'src/entities';
import { Repository } from 'typeorm';
import { StudentInternService } from './student-intern.service';
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

export class ReportInternService {
  constructor(
    @InjectRepository(ReportIntern)
    private readonly reportInternRepository: Repository<ReportIntern>,
    private readonly studentInternService: StudentInternService,
    private readonly semesterService: SemesterService,
    // private readonly s3ClientUtils: S3ClientUtil,
  ) {}

  async create(reportIntern: ReportInternDto): Promise<ReportIntern> {
    const studentIntern = await this.getStudentIntern(reportIntern.student_id);

    reportIntern.student_intern_id = studentIntern.id;
    reportIntern.file_key = `intern/${randomName()}`;
    reportIntern.file_name = reportIntern.file.originalname;
    await uploadFile(reportIntern, reportIntern.file_key);

    // delete reportIntern.student_id;
    return await this.reportInternRepository.save(reportIntern);
  }

  async getLists(options): Promise<ReportIntern[]> {
    return await this.reportInternRepository.find({ ...options });
  }

  async findOne(options): Promise<ReportIntern> {
    return await this.reportInternRepository.findOne({ ...options });
  }

  async update(id: number, reportIntern: ReportInternDto): Promise<ReportIntern> {
    return await this.reportInternRepository.save(reportIntern);
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
}
