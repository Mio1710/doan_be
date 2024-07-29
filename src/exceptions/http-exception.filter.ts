import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { getStatusCodeMessage } from 'src/constants/http.constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;
    const message =
      (exception as any)?.getResponse() ?? getStatusCodeMessage(500);

    console.log('exception', exception);

    response.status(status).json({
      status,
      success: false,
      // data: request.body,
      error: message,
    });
  }
}
