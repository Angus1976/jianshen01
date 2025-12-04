"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionMiddleware = exports.adminAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const response_1 = require("../utils/response");
/**
 * 管理员认证中间件
 */
const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.error)(res, 401, '未授权访问', 401);
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.adminSecret);
            req.admin = decoded;
            next();
        }
        catch (err) {
            return (0, response_1.error)(res, 401, 'Token 无效或已过期', 401);
        }
    }
    catch (err) {
        next(err);
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
/**
 * 权限检查中间件
 */
const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return (0, response_1.error)(res, 401, '未授权访问', 401);
        }
        // 超级管理员拥有所有权限
        if (req.admin.permissions.includes('*')) {
            return next();
        }
        if (!req.admin.permissions.includes(requiredPermission)) {
            return (0, response_1.error)(res, 403, '没有操作权限', 403);
        }
        next();
    };
};
exports.permissionMiddleware = permissionMiddleware;
