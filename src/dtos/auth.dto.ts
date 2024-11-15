import { IsNotEmpty, Length } from 'class-validator';

export class SingInDto {
  maso: string;
  matkhau: string;
  type?: string;
}

export class ChangePasswordDto {
  @Length(8, 20)
  @IsNotEmpty()
  old_password: string;

  @Length(8, 20)
  @IsNotEmpty()
  new_password: string;
}

export class UpdateProfileDto {
  @Length(10, 11)
  phone: string;
}
