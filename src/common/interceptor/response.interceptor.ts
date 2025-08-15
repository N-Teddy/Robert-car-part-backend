// src/common/interceptors/response.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorator/response-message.decorator';
import { ResponseMessageEnum } from '../enum/response-message.enum';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseMessage = this.reflector.get<ResponseMessageEnum>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    ) || ResponseMessageEnum.SUCCESS;

    return next.handle().pipe(
      map((data) => ({
        message: responseMessage,
        data,
      })),
    );
  }
}