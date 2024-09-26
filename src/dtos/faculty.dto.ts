import { IsNotEmpty } from 'class-validator';

export class FacultyDto {
  ma_khoa?: string;

  @IsNotEmpty()
  ten: string;
}
