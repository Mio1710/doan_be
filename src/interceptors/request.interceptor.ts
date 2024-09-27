import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { BaseQuery } from 'src/interfaces';
import { In, IsNull } from 'typeorm';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    const query: BaseQuery = request?.query?.conditions;

    // if (query) {
    //   Object.keys(query).forEach((e) => {
    //     // Parse query params
    //     if (!query[e]) {
    //       delete query[e];
    //       return;
    //     }
    //     if (query[e] === 'null') {
    //       query[e] = IsNull();
    //     } else if (typeof query[e] === 'string') {
    //       query[e] = query[e].split(',');
    //       if (query[e].length === 1) {
    //         query[e] = query[e][0];
    //       } else {
    //         query[e] = In(query[e]);
    //       }
    //     }
    //   });
    // }

    // set UserId for request
    this.cls.set('userId', user?.id || null);
    this.cls.set('khoa_id', user?.khoa_id || null);
    return next.handle();
  }
}
