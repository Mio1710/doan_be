import {
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @Length(0, 1000)
  ten: string;

  @IsOptional()
  @Length(0, 1000)
  description: string;

  @IsOptional()
  @Length(0, 1000)
  knowledge: string;

  @IsOptional()
  @Length(0, 1000)
  requirement: string;

  @IsOptional()
  teacher_id: number;
}

export class UpdateTopicDto {
  @IsNotEmpty()
  ten: string;
}

export class ReportTopicDto {
  @IsNotEmpty()
  week: number;

  // @IsNotEmpty()
  file;

  @IsNotEmpty()
  description: string;

  @IsEmpty()
  student_id: number;

  // @IsEmpty()
  student_topic_id: number;

  file_key: string;

  file_name: string;
}

export class UpdateReportTopicDto {
  @IsNotEmpty()
  week: number;

  file;

  @IsNotEmpty()
  description: string;

  @IsEmpty()
  student_id: number;

  // @IsEmpty()
  student_topic_id: number;

  file_key: string;

  file_name: string;
}

export class CreateRecommendTopicDto {
  @IsNotEmpty()
  ten: string;

  @IsNotEmpty()
  teacher_id: number;

  @IsNotEmpty()
  knowledge: string;

  @IsNotEmpty()
  description: string;
}

export class RecommendTopicStatusDto {
  @IsNotEmpty()
  @IsEnum(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  reject_reason?: string;
}

export class CreateTopicBySubjectDto {
  @IsNotEmpty()
  ten: string;

  @IsNotEmpty()
  teacher_id: number;
}
