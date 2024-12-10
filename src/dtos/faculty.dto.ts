import { IsNotEmpty } from 'class-validator';

export class FacultyDto {
  @IsNotEmpty()
  ma_khoa?: string;

  @IsNotEmpty()
  ten: string;
}
