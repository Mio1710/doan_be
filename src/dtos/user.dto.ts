import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

// export class CreateUserDTO {
//   maso: string;
//   hodem: string;
//   ten: string;
//   email: string;
//   matkhau: string;
//   phone: string;
//   types: string[];
//   facultyId?: number;
// }

export class CreateUserDTO {
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
  matkhau: string = '123456';
  // matkhau: string;

  @IsOptional()
  khoa_id?: number;

  @IsArray()
  @IsOptional()
  roles: string[] = ['teacher'];
}

export class UpdateTeacherDto {
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
  facultyId?: number;

  @IsArray()
  @IsOptional()
  roles: string[] = ['teacher'];
}

export class ImportUserDto {
  @IsNotEmpty({ message: 'Mã số không được để trống' })
  maso: string;

  @IsNotEmpty({ message: 'Họ đệm không được để trống' })
  hodem: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  ten: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @Optional()
  @IsDate({ message: 'Ngày sinh không đúng định dạng' })
  ngay_sinh: Date;

  @Optional()
  is_admin: number;

  @Optional()
  is_super_teacher: number;

  roles: string[];
  matkhau: string;
  khoa_id: number;
}
