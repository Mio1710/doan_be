import { HttpStatusCode } from 'axios';

export const StatusMessage = {
  [HttpStatusCode.Ok]: 'Ok',
  [HttpStatusCode.Created]: 'Created',
  [HttpStatusCode.NoContent]: 'No Content',

  [HttpStatusCode.BadRequest]: 'Bad Request',
  [HttpStatusCode.Unauthorized]: 'Unauthorized',
  [HttpStatusCode.Forbidden]: 'Forbidden',
  [HttpStatusCode.BadGateway]: 'BadGateway',

  [HttpStatusCode.Conflict]: 'Conflict',
  [HttpStatusCode.InternalServerError]: 'Internal Server Error',
  [HttpStatusCode.NotFound]: 'Not Found',
  ER_DUP_ENTRY: 'Dữ liệu đã tồn tại',
  ER_NO_DEFAULT_FOR_FIELD: 'Dữ liệu không tồn tại',
};

export const getStatusCodeMessage = (statusCode: number | string): string => {
  return StatusMessage[statusCode] || 'Success';
};
