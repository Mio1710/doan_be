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

  @IsOptional()
  phone: string;

  @IsOptional()
  @Length(6, 20)
  matkhau: string = '12345678';
  // matkhau: string;

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
  matkhau: string = '123456';
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

export class StudentInfoDto {
  @IsNotEmpty()
  maso: string;

  @IsNotEmpty()
  @Length(1, 50)
  hodem: string;

  @IsNotEmpty()
  @Length(1, 500)
  ten: string;

  @IsNotEmpty()
  @Length(1, 50)
  email: string;

  @IsOptional()
  @Length(1, 11)
  phone: string;

  @IsNotEmpty()
  @Length(1, 15)
  lop: string;

  studentTopic: [];
}
