"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.paginated = paginated;
const shared_1 = require("@rocketbird/shared");
/**
 * 成功响应
 */
function success(res, data, message = 'success') {
    const response = {
        code: shared_1.ApiCode.Success,
        data,
        message,
    };
    return res.json(response);
}
/**
 * 错误响应
 */
function error(res, code, message, statusCode = 400) {
    const response = {
        code,
        data: null,
        message,
    };
    return res.status(statusCode).json(response);
}
/**
 * 分页响应
 */
function paginated(res, list, total, page, pageSize) {
    return success(res, {
        list,
        total,
        page,
        pageSize,
    });
}
