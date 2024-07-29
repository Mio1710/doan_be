import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDTO {
  maso: string;
  hodem: string;
  ten: string;
  email: string;
  matkhau: string;
  phone: string;
  type: string;
  facultyId?: number;
}

export class CreateTeacherDto {
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

  @IsNotEmpty()
  facultyId: number;

  @IsEnum({ ADMIN: 'admin', TEACHER: 'teacher' })
  @IsOptional()
  @IsString()
  type: string = 'teacher';
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

  @IsOptional()
  @IsEnum({ ADMIN: 'admin', TEACHER: 'teacher' })
  @IsString()
  type: string = 'teacher';
}
