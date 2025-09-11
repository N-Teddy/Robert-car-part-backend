"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
let ResponseInterceptor = class ResponseInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const responseMessage = this.reflector.get('response_message', context.getHandler()) || 'Operation completed successfully';
        return next.handle().pipe((0, operators_1.map)((data) => ({
            message: responseMessage,
            data,
        })), (0, operators_1.catchError)((error) => {
            const errorResponse = this.formatErrorResponse(error);
            return (0, rxjs_1.throwError)(() => errorResponse);
        }));
    }
    formatErrorResponse(error) {
        if (error instanceof common_1.HttpException) {
            const status = error.getStatus();
            const response = error.getResponse();
            return new common_1.HttpException({
                message: typeof response === 'string'
                    ? response
                    : response.message || 'An error occurred',
                data: null,
                error: typeof response === 'object' ? response : null,
            }, status);
        }
        return new common_1.HttpException({
            message: 'Internal server error',
            data: null,
            error: error.message || 'Unknown error',
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map