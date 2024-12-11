import { IsNotEmpty, IsEmpty, IsOptional } from 'class-validator';

export class CreateInternDto {
  @IsNotEmpty()
  company_name: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  company_phone: string;

  @IsNotEmpty()
  company_email: string;

  @IsNotEmpty()
  supervisor_name: string;

  @IsNotEmpty()
  supervisor_phone: string;

  @IsNotEmpty()
  supervisor_email: string;

  @IsOptional()
  teacher_id: number;
}

export class UpdateInternDto {
  @IsNotEmpty()
  company_name: string;
}

export class ReportInternDto {
  @IsNotEmpty()
  week: number;

  // @IsNotEmpty()
  file;

  @IsNotEmpty()
  description: string;

  @IsEmpty()
  student_id: number;

  // @IsEmpty()
  student_intern_id: number;

  file_key: string;

  file_name: string;
}

export class UpdateReportInternDto {
  @IsNotEmpty()
  week: number;

  file;

  @IsNotEmpty()
  description: string;

  @IsEmpty()
  student_id: number;

  // @IsEmpty()
  student_intern_id: number;

  file_key: string;

  file_name: string;
}
