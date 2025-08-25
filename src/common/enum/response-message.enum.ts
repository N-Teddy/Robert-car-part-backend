// src/common/enum/response-message.enum.ts

export enum ResponseMessageEnum {
    SUCCESS = 'Operation completed successfully.',
    CREATED = 'Resource created successfully.',
    UPDATED = 'Resource updated successfully.',
    DELETED = 'Resource deleted successfully.',
    FETCHED = 'Resources fetched successfully.',
    NOT_FOUND = 'The requested resource was not found.',
    FORBIDDEN = 'You do not have permission to access this resource.',
    UNAUTHORIZED = 'Authentication failed. Please log in.',
    BAD_REQUEST = 'The request was invalid or cannot be otherwise served.',
    INTERNAL_SERVER_ERROR = 'An unexpected error occurred on the server.',
    VALIDATION_ERROR = 'One or more fields failed validation.',
}