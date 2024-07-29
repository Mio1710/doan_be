import { IsNotEmpty, Length } from 'class-validator';

export class SingInDto {
  maso: string;
  matkhau: string;
  type?: string;
}

export class ChangePasswordDto {
  @Length(6, 20)
  @IsNotEmpty()
  matkhau: string;

  @Length(6, 20)
  @IsNotEmpty()
  newPassword: string;
}
