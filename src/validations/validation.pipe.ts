import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value;
    }
    const object = plainToInstance(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      console.log('errorvalidatevalidatevalidate', errors);
      const result = errors.map((error) => ({
        [error.property]: error.constraints[Object.keys(error.constraints)[0]],
      }));

      throw new BadRequestException({ fields: result });
    }
    return value;
  }
}
