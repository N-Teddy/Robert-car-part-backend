import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
	message: string;
	data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	constructor(private reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<Response<T>> {
		const responseMessage =
			this.reflector.get<string>(
				'response_message',
				context.getHandler()
			) || 'Operation completed successfully';

		return next.handle().pipe(
			map((data) => ({
				message: responseMessage,
				data,
			})),
			catchError((error) => {
				// Format error response
				const errorResponse = this.formatErrorResponse(error);
				return throwError(() => errorResponse);
			})
		);
	}

	private formatErrorResponse(error: any) {
		if (error instanceof HttpException) {
			const status = error.getStatus();
			const response = error.getResponse();

			return new HttpException(
				{
					message:
						typeof response === 'string'
							? response
							: (response as any).message || 'An error occurred',
					data: null,
					error: typeof response === 'object' ? response : null,
				},
				status
			);
		}

		// Handle unexpected errors
		return new HttpException(
			{
				message: 'Internal server error',
				data: null,
				error: error.message || 'Unknown error',
			},
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}
