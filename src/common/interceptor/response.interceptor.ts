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

// Interface for paginated response
export interface PaginatedResponse<T> {
	items: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

@Injectable()
export class ResponseInterceptor<T>
	implements NestInterceptor<T, Response<T | PaginatedResponse<T>>>
{
	constructor(private reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<Response<T | PaginatedResponse<T>>> {
		const responseMessage =
			this.reflector.get<string>(
				'response_message',
				context.getHandler()
			) || 'Operation completed successfully';

		return next.handle().pipe(
			map((data) => {
				// Check if data is in paginated format
				if (this.isPaginatedResponse(data)) {
					return {
						message: responseMessage,
						data: {
							items: data.users || data.items || data.data || [],
							meta: {
								total: data.total,
								page: data.page,
								limit: data.limit,
								totalPages:
									data.totalPages ||
									Math.ceil(data.total / data.limit),
								hasNext:
									data.hasNext ||
									data.page <
										(data.totalPages ||
											Math.ceil(data.total / data.limit)),
								hasPrev: data.hasPrev || data.page > 1,
							},
						},
					};
				}

				// Handle regular non-paginated response
				return {
					message: responseMessage,
					data,
				};
			}),
			catchError((error) => {
				// Format error response
				const errorResponse = this.formatErrorResponse(error);
				return throwError(() => errorResponse);
			})
		);
	}

	private isPaginatedResponse(data: any): boolean {
		// Check if data has pagination properties
		return (
			data &&
			(data.hasOwnProperty('total') ||
				data.hasOwnProperty('page') ||
				data.hasOwnProperty('limit')) &&
			(data.hasOwnProperty('users') ||
				data.hasOwnProperty('items') ||
				data.hasOwnProperty('data'))
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
