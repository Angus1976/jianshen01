"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorMiddleware = errorMiddleware;
const shared_1 = require("@rocketbird/shared");
class AppError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorMiddleware(err, req, res, _next) {
    console.error('Error:', err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            code: err.code,
            data: null,
            message: err.message,
        });
        return;
    }
    // 默认服务器错误
    res.status(500).json({
        code: shared_1.ApiCode.ServerError,
        data: null,
        message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    });
}
