import { IsNotEmpty } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  ten: string;
}

export class UpdateTopicDto {
  @IsNotEmpty()
  ten: string;
}
