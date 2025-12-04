"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const user_model_1 = require("../../models/user.model");
const level_model_1 = require("../../models/level.model");
const points_model_1 = require("../../models/points.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/members/export - 导出会员数据 (必须在 /:userId 之前)
router.get('/export', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { levelId, status, startDate, endDate } = req.query;
        const query = {};
        if (levelId)
            query.levelId = levelId;
        if (status !== undefined && status !== '')
            query.status = Number(status);
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const users = await user_model_1.User.find(query);
        // 简化导出，返回 JSON 数据，前端可以转换为 CSV/Excel
        const exportData = users.map((user) => ({
            userId: user.userId,
            nickname: user.nickname,
            phone: user.phone || '',
            levelName: user.levelName,
            growthValue: user.growthValue,
            totalPoints: user.totalPoints,
            availablePoints: user.availablePoints,
            status: user.status === 1 ? '正常' : '禁用',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        }));
        (0, response_1.success)(res, exportData);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/members - 获取会员列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, levelId, status } = req.query;
        const query = {};
        if (keyword) {
            // 按昵称或手机号搜索
            query.nickname = new RegExp(keyword, 'i');
        }
        if (levelId) {
            query.levelId = levelId;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await user_model_1.User.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/members/:userId - 获取会员详情
router.get('/:userId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await user_model_1.User.findByUserId(userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '会员不存在', 404);
        }
        // 获取积分记录
        const pointsRecords = await points_model_1.PointsRecord.findByUserId(userId, 10);
        // 获取等级变动记录
        const levelChangeLogs = await level_model_1.LevelChangeLog.findByUserId(userId);
        (0, response_1.success)(res, {
            ...user,
            pointsRecords,
            levelChangeLogs,
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/members/:userId - 更新会员信息
router.put('/:userId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { nickname, phone, birthday, gender } = req.body;
        const user = await user_model_1.User.findByUserId(userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '会员不存在', 404);
        }
        const updateData = {};
        if (nickname !== undefined)
            updateData.nickname = nickname;
        if (phone !== undefined)
            updateData.phone = phone;
        if (birthday !== undefined)
            updateData.birthday = new Date(birthday);
        if (gender !== undefined)
            updateData.gender = gender;
        await user_model_1.User.updateById(user._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/members/:userId/status - 更新会员状态
router.put('/:userId/status', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        if (status !== 0 && status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '状态值无效');
        }
        const user = await user_model_1.User.findByUserId(userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '会员不存在', 404);
        }
        await user_model_1.User.updateById(user._id, { status });
        (0, response_1.success)(res, { message: status === 1 ? '启用成功' : '禁用成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/members/:userId/level - 调整会员等级
router.put('/:userId/level', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { levelId, reason } = req.body;
        if (!levelId) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请选择等级');
        }
        const user = await user_model_1.User.findByUserId(userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '会员不存在', 404);
        }
        const newLevel = await level_model_1.LevelRule.findByLevelId(levelId);
        if (!newLevel) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '等级不存在');
        }
        // 记录等级变动
        await level_model_1.LevelChangeLog.create({
            logId: (0, uuid_1.v4)(),
            userId,
            beforeLevelId: user.levelId,
            beforeLevelName: user.levelName,
            afterLevelId: levelId,
            afterLevelName: newLevel.name,
            changeType: 'manual',
            reason: reason || '管理员手动调整',
            operatorId: req.admin.adminId,
            operatorName: req.admin.username,
        });
        // 更新用户等级
        await user_model_1.User.updateLevel(userId, levelId, newLevel.name);
        (0, response_1.success)(res, { message: '等级调整成功' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/members/:userId/points - 调整会员积分
router.post('/:userId/points', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;
        if (!points || points === 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请输入调整积分数');
        }
        const user = await user_model_1.User.findByUserId(userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '会员不存在', 404);
        }
        // 检查扣减积分是否足够
        if (points < 0 && user.availablePoints + points < 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '可用积分不足');
        }
        // 更新积分
        await user_model_1.User.updatePoints(userId, points);
        // 记录积分流水
        await points_model_1.PointsRecord.create({
            recordId: (0, uuid_1.v4)(),
            userId,
            type: points > 0 ? 'earn' : 'consume',
            points,
            balance: user.availablePoints + points,
            source: 'admin',
            description: reason || (points > 0 ? '管理员增加积分' : '管理员扣减积分'),
        });
        (0, response_1.success)(res, { message: '积分调整成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
