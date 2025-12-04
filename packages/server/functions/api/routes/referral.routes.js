"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const response_1 = require("../utils/response");
const user_model_1 = require("../models/user.model");
const referral_model_1 = require("../models/referral.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/referral/my-code - 获取我的邀请码
router.get('/my-code', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 获取当前邀请规则
        const rule = await referral_model_1.InviteRule.findActiveRule();
        // 生成邀请链接
        const inviteUrl = `${process.env.H5_BASE_URL || 'https://example.com'}/pages/login/index?inviteCode=${user.inviteCode}`;
        (0, response_1.success)(res, {
            inviteCode: user.inviteCode,
            inviteUrl,
            inviterReward: (rule === null || rule === void 0 ? void 0 : rule.inviterReward) || 0,
            inviteeReward: (rule === null || rule === void 0 ? void 0 : rule.inviteeReward) || 0,
            rewardCondition: (rule === null || rule === void 0 ? void 0 : rule.rewardCondition) || 'register',
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/referral/generate-poster - 生成邀请海报
router.post('/generate-poster', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 在实际生产环境中，这里应该调用图片生成服务生成海报
        // 目前返回一个模拟的海报URL
        const posterData = {
            inviteCode: user.inviteCode,
            nickname: user.nickname,
            avatar: user.avatar,
            // 海报URL (实际应用中应该是动态生成的)
            posterUrl: `${process.env.CDN_BASE_URL || ''}/posters/invite_${user.inviteCode}.png`,
            qrcodeUrl: `${process.env.H5_BASE_URL || 'https://example.com'}/pages/login/index?inviteCode=${user.inviteCode}`,
        };
        (0, response_1.success)(res, posterData);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/referral/records - 获取邀请记录
router.get('/records', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query;
        const query = { inviterId: req.user.userId };
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
// GET /api/referral/stats - 获取邀请统计
router.get('/stats', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        // 获取总邀请数
        const totalInvites = await referral_model_1.InviteRecord.countByInviterId(userId);
        // 获取今日邀请数
        const todayInvites = await referral_model_1.InviteRecord.countTodayByInviterId(userId);
        // 获取所有邀请记录计算奖励
        const records = await referral_model_1.InviteRecord.findByInviterId(userId);
        // 计算已获得奖励积分
        const earnedPoints = records
            .filter(r => r.status === 1)
            .reduce((sum, r) => sum + r.rewardPoints, 0);
        // 计算待发放奖励
        const pendingPoints = records
            .filter(r => r.status === 0)
            .reduce((sum, r) => sum + r.rewardPoints, 0);
        // 获取用户邀请码
        const user = await user_model_1.User.findByUserId(userId);
        (0, response_1.success)(res, {
            inviteCode: user === null || user === void 0 ? void 0 : user.inviteCode,
            totalInvites,
            todayInvites,
            earnedPoints,
            pendingPoints,
            // 邀请排名（可以后续实现）
            ranking: null,
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/referral/validate-code - 验证邀请码
router.post('/validate-code', async (req, res, next) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请输入邀请码');
        }
        const inviter = await user_model_1.User.findByInviteCode(inviteCode);
        if (!inviter) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '邀请码不存在', 404);
        }
        // 获取邀请规则
        const rule = await referral_model_1.InviteRule.findActiveRule();
        (0, response_1.success)(res, {
            valid: true,
            inviterNickname: inviter.nickname,
            inviterAvatar: inviter.avatar,
            inviteeReward: (rule === null || rule === void 0 ? void 0 : rule.inviteeReward) || 0,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/referral/rules - 获取邀请规则
router.get('/rules', async (req, res, next) => {
    try {
        const rule = await referral_model_1.InviteRule.findActiveRule();
        if (!rule) {
            return (0, response_1.success)(res, {
                enabled: false,
                message: '邀请活动暂未开放',
            });
        }
        (0, response_1.success)(res, {
            enabled: true,
            inviterReward: rule.inviterReward,
            inviteeReward: rule.inviteeReward,
            rewardCondition: rule.rewardCondition,
            maxInvitesPerDay: rule.maxInvitesPerDay,
            maxInvitesTotal: rule.maxInvitesTotal,
            description: rule.description,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
