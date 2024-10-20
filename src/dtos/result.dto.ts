import { IsNotEmpty, IsOptional } from 'class-validator';

export class LOResultItemDto {
  @IsNotEmpty()
  lo_id: number;

  @IsOptional()
  score: number;
}
