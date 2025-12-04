"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const admin_model_1 = require("../../models/admin.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/logs/export - 导出操作日志 (必须在 /:logId 之前)
router.get('/export', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId, module, startDate, endDate } = req.query;
        const query = {};
        if (adminId) {
            query.adminId = adminId;
        }
        if (module) {
            query.module = module;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const logs = await admin_model_1.OperationLog.find(query);
        // 简化导出，返回 JSON 数据
        const exportData = logs.map((log) => ({
            logId: log.logId,
            adminName: log.adminName,
            module: log.module,
            action: log.action,
            content: log.content,
            ip: log.ip,
            createdAt: log.createdAt,
        }));
        (0, response_1.success)(res, exportData);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/logs - 操作日志查询
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, adminId, module, action, startDate, endDate } = req.query;
        const query = {};
        if (adminId) {
            query.adminId = adminId;
        }
        if (module) {
            query.module = module;
        }
        if (action) {
            query.action = action;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const result = await admin_model_1.OperationLog.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/logs/:logId - 获取日志详情
router.get('/:logId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { logId } = req.params;
        const log = await admin_model_1.OperationLog.findOne({ logId });
        if (!log) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '日志不存在', 404);
        }
        (0, response_1.success)(res, log);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
