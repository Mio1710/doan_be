import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class BaseQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  created_by?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  updated_by?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  deleted_by?: number;
}
