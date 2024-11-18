import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  maso: string;

  @IsNotEmpty()
  hodem: string;

  @IsNotEmpty()
  ten: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @Length(6, 20)
  matkhau: string = '12345678';
  
  @IsNotEmpty()
  lop: string;

  @IsOptional()
  khoa_id?: number;
}

export class UpdateStudentDto {
  @IsNotEmpty()
  maso: string;

  @IsNotEmpty()
  hodem: string;

  @IsNotEmpty()
  ten: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @Length(6, 20)
  matkhau: string = '12345678';
  // matkhau: string;

  @IsOptional()
  lop?: string;
}

export class UpdateStudentTopicDto {
  @IsOptional()
  partner_id?: number;

  @IsOptional()
  topic_id?: number;
}

export class UpdateStudentInternDto {
  @IsOptional()
  student_intern_id?: number;

  @IsOptional()
  intern_id?: number;
}

