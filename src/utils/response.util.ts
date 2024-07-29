import { Res } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ResponseInterface } from 'src/interfaces';
import { getStatusCodeMessage } from 'src/constants/http.constants';
export class ResponseUtils {
  failed(response: ResponseInterface, @Res() res: Response) {
    const status_code = response.status_code ?? HttpStatusCode.BadRequest;
    console.log('response trong utils', response);

    const result = {
      status_code,
      message: response.message ?? getStatusCodeMessage(status_code),
    };

    return res.status(status_code).json(result);
  }

  success(response: any, @Res() res: Response) {
    const status_code = response.status_code ?? HttpStatusCode.Ok;
    console.log('response', response.meta, response, status_code);

    const result = {
      status_code,
      data:
        response.data || response.message || getStatusCodeMessage(status_code),
      meta: response.meta,
    };
    // lập tức trả về response, kết thúc request, không thể tiếp tục interceptor(s)
    console.log('end response utils', result);
    return res.status(status_code).json(result);
  }
}
