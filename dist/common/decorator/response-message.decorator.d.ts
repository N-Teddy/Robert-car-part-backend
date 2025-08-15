import { ResponseMessageEnum } from '../enum/response-message.enum';
export declare const RESPONSE_MESSAGE_KEY = "responseMessage";
export declare const ResponseMessage: (message: ResponseMessageEnum) => import("@nestjs/common").CustomDecorator<string>;
