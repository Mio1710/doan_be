import { IsNotEmpty } from 'class-validator';

export class CreateInternDto {
  @IsNotEmpty()
  company_name: string;
}

export class UpdateInternDto {
  @IsNotEmpty()
  company_name: string;
}
