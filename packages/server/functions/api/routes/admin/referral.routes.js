"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const referral_model_1 = require("../../models/referral.model");
const router = (0, express_1.Router)();
// GET /api/admin/referral/stats - 邀请统计分析
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // 总邀请数
        const totalInvites = await referral_model_1.InviteRecord.count({});
        // 已奖励数
        const rewardedInvites = await referral_model_1.InviteRecord.count({ status: 1 });
        // 今日邀请数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayInvites = await referral_model_1.InviteRecord.count({
            createdAt: { $gte: today, $lt: tomorrow },
        });
        // 计算总奖励积分
        const records = await referral_model_1.InviteRecord.find({ status: 1 });
        const totalRewardPoints = records.reduce((sum, r) => sum + r.rewardPoints, 0);
        (0, response_1.success)(res, {
            totalInvites,
            rewardedInvites,
            todayInvites,
            totalRewardPoints,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/referral/ranking - 邀请排行榜
router.get('/ranking', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        // 获取所有邀请记录并按邀请人分组统计
        const records = await referral_model_1.InviteRecord.find({});
        const inviterStats = {};
        for (const record of records) {
            if (!inviterStats[record.inviterId]) {
                inviterStats[record.inviterId] = {
                    inviterId: record.inviterId,
                    inviterNickname: record.inviterNickname,
                    count: 0,
                };
            }
            inviterStats[record.inviterId].count++;
        }
        // 转换为数组并排序
        const ranking = Object.values(inviterStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, Number(limit));
        (0, response_1.success)(res, ranking);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/referral/rules - 获取邀请规则
router.get('/rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const rule = await referral_model_1.InviteRule.findActiveRule();
        (0, response_1.success)(res, rule || {});
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/referral/rules - 更新邀请规则
router.put('/rules', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, inviterReward, inviteeReward, rewardCondition, maxInvitesPerDay, maxInvitesTotal, status, } = req.body;
        let rule = await referral_model_1.InviteRule.findActiveRule();
        if (rule) {
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (inviterReward !== undefined)
                updateData.inviterReward = inviterReward;
            if (inviteeReward !== undefined)
                updateData.inviteeReward = inviteeReward;
            if (rewardCondition !== undefined)
                updateData.rewardCondition = rewardCondition;
            if (maxInvitesPerDay !== undefined)
                updateData.maxInvitesPerDay = maxInvitesPerDay;
            if (maxInvitesTotal !== undefined)
                updateData.maxInvitesTotal = maxInvitesTotal;
            if (status !== undefined)
                updateData.status = status;
            await referral_model_1.InviteRule.updateById(rule._id, updateData);
        }
        else {
            rule = await referral_model_1.InviteRule.create({
                ruleId: (0, uuid_1.v4)(),
                name: name || '邀请奖励',
                description: description || '',
                inviterReward: inviterReward || 100,
                inviteeReward: inviteeReward || 50,
                rewardCondition: rewardCondition || 'register',
                maxInvitesPerDay: maxInvitesPerDay || 0,
                maxInvitesTotal: maxInvitesTotal || 0,
                status: status || 1,
            });
        }
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/referral/records - 获取所有邀请记录
router.get('/records', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, inviterId, status } = req.query;
        const query = {};
        if (inviterId) {
            query.inviterId = inviterId;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await referral_model_1.InviteRecord.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
