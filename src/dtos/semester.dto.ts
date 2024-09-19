import { IsNotEmpty } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  ten: string;
}

export class UpdateSemesterDto {
  @IsNotEmpty()
  ten: string;
}
