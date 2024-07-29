import { IsNotEmpty } from 'class-validator';

export class FaculityDto {
  @IsNotEmpty()
  makhoa: string;

  @IsNotEmpty()
  ten: string;
}
