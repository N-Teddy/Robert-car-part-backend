"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMessageEnum = void 0;
var ResponseMessageEnum;
(function (ResponseMessageEnum) {
    ResponseMessageEnum["SUCCESS"] = "Operation completed successfully.";
    ResponseMessageEnum["CREATED"] = "Resource created successfully.";
    ResponseMessageEnum["UPDATED"] = "Resource updated successfully.";
    ResponseMessageEnum["DELETED"] = "Resource deleted successfully.";
    ResponseMessageEnum["FETCHED"] = "Resources fetched successfully.";
    ResponseMessageEnum["NOT_FOUND"] = "The requested resource was not found.";
    ResponseMessageEnum["FORBIDDEN"] = "You do not have permission to access this resource.";
    ResponseMessageEnum["UNAUTHORIZED"] = "Authentication failed. Please log in.";
    ResponseMessageEnum["BAD_REQUEST"] = "The request was invalid or cannot be otherwise served.";
    ResponseMessageEnum["INTERNAL_SERVER_ERROR"] = "An unexpected error occurred on the server.";
    ResponseMessageEnum["VALIDATION_ERROR"] = "One or more fields failed validation.";
})(ResponseMessageEnum || (exports.ResponseMessageEnum = ResponseMessageEnum = {}));
//# sourceMappingURL=response-message.enum.js.map