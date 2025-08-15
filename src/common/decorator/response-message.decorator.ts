// src/common/decorator/response-message.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ResponseMessageEnum } from '../enum/response-message.enum';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';
export const ResponseMessage = (message: ResponseMessageEnum) =>
    SetMetadata(RESPONSE_MESSAGE_KEY, message);