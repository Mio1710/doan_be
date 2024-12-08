import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  ten: string;

  @IsOptional()
  @Length(0, 250, { message: 'Ghi chú không quá 250 ký tự' })
  note: string;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  end_date: Date;

  @IsOptional()
  start_register_group: Date;

  @IsOptional()
  end_register_group: Date;

  @IsOptional()
  start_publish_topic: Date;

  @IsOptional()
  end_publish_topic: Date;

  @IsOptional()
  start_register_topic: Date;

  @IsOptional()
  end_register_topic: Date;

  @IsOptional()
  start_defense: Date;

  @IsOptional()
  end_defense: Date;

  @IsOptional()
  start_report_topic: Date;

  @IsOptional()
  end_report_topic: Date;

  @IsOptional()
  public_result: Date;
}

export class UpdateSemesterDto {
  @IsNotEmpty()
  ten: string;

  @IsOptional()
  @Length(0, 250, { message: 'Ghi chú không quá 250 ký tự' })
  note: string;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  end_date: Date;

  @IsOptional()
  start_register_group: Date;

  @IsOptional()
  end_register_group: Date;

  @IsOptional()
  start_publish_topic: Date;

  @IsOptional()
  end_publish_topic: Date;

  @IsOptional()
  start_register_topic: Date;

  @IsOptional()
  end_register_topic: Date;

  @IsOptional()
  start_defense: Date;

  @IsOptional()
  end_defense: Date;

  @IsOptional()
  start_report_topic: Date;

  @IsOptional()
  end_report_topic: Date;

  @IsOptional()
  public_result: Date;
}
