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
  matkhau: string = '123456';
  // matkhau: string;

  @IsNotEmpty()
  facultyId: number;
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
  facultyId?: number;
}
