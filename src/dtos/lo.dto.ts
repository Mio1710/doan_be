import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateLODto {
  @IsNotEmpty()
  main_criteria: string;

  @IsOptional()
  sub_criteria: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001, { message: 'Hệ số phải lớn hơn 0' })
  @Max(10, { message: 'Hệ số phải nhỏ hơn hoặc bằng 10' })
  cof: number;

  @IsOptional()
  @IsBoolean()
  allow_update: boolean;
}
