import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  ten: string;
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

  @IsEmpty()
  student_topic_id: number;

  file_key: string;

  file_name: string;
}
