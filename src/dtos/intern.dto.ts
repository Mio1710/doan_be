import { IsNotEmpty, IsEmpty } from 'class-validator';

export class CreateInternDto {
  @IsNotEmpty()
  company_name: string;
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

  @IsEmpty()
  student_intern_id: number;

  file_key: string;

  file_name: string;
}