"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const error_middleware_1 = require("./error.middleware");
const shared_1 = require("@rocketbird/shared");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_middleware_1.AppError(shared_1.ApiCode.Unauthorized, '未登录或登录已过期', 401);
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new error_middleware_1.AppError(shared_1.ApiCode.Unauthorized, '登录已过期，请重新登录', 401));
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_middleware_1.AppError(shared_1.ApiCode.Unauthorized, '无效的登录凭证', 401));
        }
        else {
            next(error);
        }
    }
}
function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            req.user = decoded;
        }
        next();
    }
    catch (_a) {
        // 可选认证，忽略错误
        next();
    }
}
