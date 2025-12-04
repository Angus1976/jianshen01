"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const level_model_1 = require("../../models/level.model");
const user_model_1 = require("../../models/user.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/levels/stats - 等级分布统计 (必须在 /:levelId 之前)
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const levels = await level_model_1.LevelRule.findActiveRules();
        const stats = await Promise.all(levels.map(async (level) => {
            const count = await user_model_1.User.count({ levelId: level.levelId });
            return {
                levelId: level.levelId,
                levelName: level.name,
                count,
            };
        }));
        const totalUsers = await user_model_1.User.count({});
        (0, response_1.success)(res, { stats, totalUsers });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/levels - 获取等级规则列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query;
        const query = {};
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await level_model_1.LevelRule.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/levels - 创建等级规则
router.post('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, code, minGrowth, maxGrowth, icon, color, benefits, sortOrder } = req.body;
        if (!name || !code) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '等级名称和编码不能为空');
        }
        if (minGrowth === undefined || maxGrowth === undefined) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '成长值范围不能为空');
        }
        // 检查编码是否已存在
        const existingLevel = await level_model_1.LevelRule.findByCode(code);
        if (existingLevel) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '等级编码已存在');
        }
        const level = await level_model_1.LevelRule.create({
            levelId: (0, uuid_1.v4)(),
            name,
            code,
            minGrowth,
            maxGrowth,
            icon: icon || '',
            color: color || '#1890ff',
            benefits: benefits || [],
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, level, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/levels/:levelId - 获取等级详情
router.get('/:levelId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const level = await level_model_1.LevelRule.findByLevelId(levelId);
        if (!level) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '等级不存在', 404);
        }
        (0, response_1.success)(res, level);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/levels/:levelId - 更新等级规则
router.put('/:levelId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const { name, minGrowth, maxGrowth, icon, color, benefits, sortOrder, status } = req.body;
        const level = await level_model_1.LevelRule.findByLevelId(levelId);
        if (!level) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '等级不存在', 404);
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (minGrowth !== undefined)
            updateData.minGrowth = minGrowth;
        if (maxGrowth !== undefined)
            updateData.maxGrowth = maxGrowth;
        if (icon !== undefined)
            updateData.icon = icon;
        if (color !== undefined)
            updateData.color = color;
        if (benefits !== undefined)
            updateData.benefits = benefits;
        if (sortOrder !== undefined)
            updateData.sortOrder = sortOrder;
        if (status !== undefined)
            updateData.status = status;
        await level_model_1.LevelRule.updateById(level._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/levels/:levelId - 删除等级规则
router.delete('/:levelId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { levelId } = req.params;
        const level = await level_model_1.LevelRule.findByLevelId(levelId);
        if (!level) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '等级不存在', 404);
        }
        // 检查是否有用户在使用此等级
        const usersWithLevel = await user_model_1.User.count({ levelId });
        if (usersWithLevel > 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该等级下存在用户，无法删除');
        }
        await level_model_1.LevelRule.deleteById(level._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
