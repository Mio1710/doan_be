import { IsNotEmpty, IsString } from 'class-validator';

export class TeacherGroupCreateDto {
  @IsString()
  name: string;

  @IsNotEmpty()
  teacher_ids: number[];
}
