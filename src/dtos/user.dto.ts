import { IsArray, IsNotEmpty, IsOptional, Length } from 'class-validator';

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
