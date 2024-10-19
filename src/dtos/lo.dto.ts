import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLODto {
  @IsNotEmpty()
  main_criteria: string;

  sub_criteria: string;

  @IsNotEmpty()
  @IsNumber()
  cof: number;

  @IsOptional()
  @IsBoolean()
  allow_update: boolean;
}

export class UpdateLODto {
  @IsNotEmpty()
  ten: string;
}
