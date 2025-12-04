"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const benefits_model_1 = require("../../models/benefits.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/benefits/stats - 福利统计
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // 规则数量
        const ruleCount = await benefits_model_1.BenefitRule.count({ status: 1 });
        // 发放记录统计
        const totalRecords = await benefits_model_1.BenefitRecord.count({});
        const pendingRecords = await benefits_model_1.BenefitRecord.count({ status: 0 });
        const claimedRecords = await benefits_model_1.BenefitRecord.count({ status: 1 });
        const usedRecords = await benefits_model_1.BenefitRecord.count({ status: 2 });
        const expiredRecords = await benefits_model_1.BenefitRecord.count({ status: 3 });
        (0, response_1.success)(res, {
            ruleCount,
            totalRecords,
            pendingRecords,
            claimedRecords,
            usedRecords,
            expiredRecords,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/benefits/rules - 获取福利规则列表
router.get('/rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, type, status } = req.query;
        const query = {};
        if (type) {
            query.type = type;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await benefits_model_1.BenefitRule.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/benefits/rules - 创建福利规则
router.post('/rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, type, description, rewardType, rewardValue, rewardUnit, conditions, validDays, autoGrant, sortOrder, } = req.body;
        if (!name || !type || !rewardType) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '规则名称、类型和奖励类型不能为空');
        }
        const rule = await benefits_model_1.BenefitRule.create({
            ruleId: (0, uuid_1.v4)(),
            name,
            type,
            description: description || '',
            rewardType,
            rewardValue: rewardValue || 0,
            rewardUnit: rewardUnit || '',
            conditions: conditions || {},
            validDays: validDays || 30,
            autoGrant: autoGrant || false,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, rule, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/benefits/rules/:ruleId - 更新福利规则
router.put('/rules/:ruleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { ruleId } = req.params;
        const updateFields = req.body;
        const rule = await benefits_model_1.BenefitRule.findByRuleId(ruleId);
        if (!rule) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '规则不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'name', 'description', 'rewardType', 'rewardValue',
            'rewardUnit', 'conditions', 'validDays', 'autoGrant', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        await benefits_model_1.BenefitRule.updateById(rule._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/benefits/rules/:ruleId - 删除福利规则
router.delete('/rules/:ruleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { ruleId } = req.params;
        const rule = await benefits_model_1.BenefitRule.findByRuleId(ruleId);
        if (!rule) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '规则不存在', 404);
        }
        await benefits_model_1.BenefitRule.deleteById(rule._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/benefits/records - 获取福利发放记录
router.get('/records', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, ruleId, type, status, userId } = req.query;
        const query = {};
        if (ruleId) {
            query.ruleId = ruleId;
        }
        if (type) {
            query.type = type;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        if (userId) {
            query.userId = userId;
        }
        const result = await benefits_model_1.BenefitRecord.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
