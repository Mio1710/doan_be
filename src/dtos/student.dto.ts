import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

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

export class ImportStudentDto {
  @IsNotEmpty({ message: 'Mã số không được để trống' })
  maso: string;

  @IsNotEmpty({ message: 'Họ đệm không được để trống' })
  hodem: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  ten: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @Optional()
  @Matches(/^([0-2][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, {
    message: 'Ngày sinh không đúng định dạng (dd/MM/yyyy)',
  })
  ngay_sinh?: Date;

  matkhau: string;
  khoa_id: number;
}
