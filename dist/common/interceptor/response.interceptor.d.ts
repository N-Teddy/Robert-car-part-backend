import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
export interface Response<T> {
    message: string;
    data: T;
}
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
export declare class ResponseInterceptor<T> implements NestInterceptor<T, Response<T | PaginatedResponse<T>>> {
    private reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T | PaginatedResponse<T>>>;
    private isPaginatedResponse;
    private formatErrorResponse;
}
