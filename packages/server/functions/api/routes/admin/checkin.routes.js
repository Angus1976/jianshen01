"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const checkin_model_1 = require("../../models/checkin.model");
const user_model_1 = require("../../models/user.model");
const points_model_1 = require("../../models/points.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/checkin/stats - 打卡统计
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // 今日打卡数
        const todayCheckins = await checkin_model_1.CheckinRecord.count({
            createdAt: { $gte: today, $lt: tomorrow },
        });
        // 总打卡数
        const totalCheckins = await checkin_model_1.CheckinRecord.count({});
        // 待审核数
        const pendingReview = await checkin_model_1.CheckinRecord.count({ reviewStatus: 0 });
        // 主题数量
        const themeCount = await checkin_model_1.CheckinTheme.count({ status: 1 });
        (0, response_1.success)(res, {
            todayCheckins,
            totalCheckins,
            pendingReview,
            themeCount,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/checkin/share-rules - 获取分享规则
router.get('/share-rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const rule = await checkin_model_1.ShareRule.findActiveRule();
        (0, response_1.success)(res, rule || {});
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/checkin/share-rules - 更新分享规则
router.put('/share-rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, rewardPoints, dailyLimit, totalLimit, status } = req.body;
        let rule = await checkin_model_1.ShareRule.findActiveRule();
        if (rule) {
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (rewardPoints !== undefined)
                updateData.rewardPoints = rewardPoints;
            if (dailyLimit !== undefined)
                updateData.dailyLimit = dailyLimit;
            if (totalLimit !== undefined)
                updateData.totalLimit = totalLimit;
            if (status !== undefined)
                updateData.status = status;
            await checkin_model_1.ShareRule.updateById(rule._id, updateData);
        }
        else {
            rule = await checkin_model_1.ShareRule.create({
                ruleId: (0, uuid_1.v4)(),
                name: name || '分享奖励',
                description: description || '',
                rewardPoints: rewardPoints || 10,
                dailyLimit: dailyLimit || 1,
                totalLimit: totalLimit || 0,
                status: status || 1,
            });
        }
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/checkin/themes - 获取打卡主题列表
router.get('/themes', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, status } = req.query;
        const query = {};
        if (keyword) {
            query.name = new RegExp(keyword, 'i');
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await checkin_model_1.CheckinTheme.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/checkin/themes - 创建打卡主题
router.post('/themes', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, coverImage, bgImage, templateImages, stickerImages, rewardPoints, shareRewardPoints, maxDailyCheckin, sortOrder, } = req.body;
        if (!name) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '主题名称不能为空');
        }
        const theme = await checkin_model_1.CheckinTheme.create({
            themeId: (0, uuid_1.v4)(),
            name,
            description: description || '',
            coverImage: coverImage || '',
            bgImage,
            templateImages: templateImages || [],
            stickerImages: stickerImages || [],
            rewardPoints: rewardPoints || 10,
            shareRewardPoints: shareRewardPoints || 5,
            maxDailyCheckin: maxDailyCheckin || 1,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, theme, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/checkin/themes/:themeId - 更新打卡主题
router.put('/themes/:themeId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { themeId } = req.params;
        const updateFields = req.body;
        const theme = await checkin_model_1.CheckinTheme.findByThemeId(themeId);
        if (!theme) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '主题不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'name', 'description', 'coverImage', 'bgImage',
            'templateImages', 'stickerImages', 'rewardPoints',
            'shareRewardPoints', 'maxDailyCheckin', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        await checkin_model_1.CheckinTheme.updateById(theme._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/checkin/themes/:themeId - 删除打卡主题
router.delete('/themes/:themeId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { themeId } = req.params;
        const theme = await checkin_model_1.CheckinTheme.findByThemeId(themeId);
        if (!theme) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '主题不存在', 404);
        }
        // 检查是否有打卡记录使用此主题
        const recordCount = await checkin_model_1.CheckinRecord.count({ themeId });
        if (recordCount > 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该主题下有打卡记录，无法删除');
        }
        await checkin_model_1.CheckinTheme.deleteById(theme._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/checkin/records - 获取打卡记录列表
router.get('/records', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, themeId, reviewStatus, userId } = req.query;
        const query = {};
        if (themeId) {
            query.themeId = themeId;
        }
        if (reviewStatus !== undefined && reviewStatus !== '') {
            query.reviewStatus = Number(reviewStatus);
        }
        if (userId) {
            query.userId = userId;
        }
        const result = await checkin_model_1.CheckinRecord.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/checkin/records/:recordId/review - 审核打卡
router.put('/records/:recordId/review', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { recordId } = req.params;
        const { reviewStatus, reviewReason } = req.body;
        if (reviewStatus !== 1 && reviewStatus !== 2) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '审核状态无效');
        }
        const record = await checkin_model_1.CheckinRecord.findByRecordId(recordId);
        if (!record) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '记录不存在', 404);
        }
        if (record.reviewStatus !== 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该记录已审核');
        }
        await checkin_model_1.CheckinRecord.updateById(record._id, {
            reviewStatus,
            reviewReason: reviewReason || '',
            reviewedAt: new Date(),
            reviewedBy: req.admin.adminId,
        });
        // 如果审核通过，发放积分
        if (reviewStatus === 1 && record.rewardPoints > 0) {
            await user_model_1.User.updatePoints(record.userId, record.rewardPoints);
            await points_model_1.PointsRecord.create({
                recordId: (0, uuid_1.v4)(),
                userId: record.userId,
                type: 'earn',
                points: record.rewardPoints,
                balance: 0, // 需要从用户处获取
                source: 'checkin',
                sourceId: recordId,
                description: `打卡奖励 - ${record.themeName}`,
            });
        }
        (0, response_1.success)(res, { message: reviewStatus === 1 ? '审核通过' : '审核拒绝' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
