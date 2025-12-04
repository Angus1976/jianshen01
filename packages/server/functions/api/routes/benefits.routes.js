"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const response_1 = require("../utils/response");
const user_model_1 = require("../models/user.model");
const benefits_model_1 = require("../models/benefits.model");
const points_model_1 = require("../models/points.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/benefits/available - 获取可用福利列表
router.get('/available', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        const rules = await benefits_model_1.BenefitRule.findActiveRules();
        // 过滤出用户可领取的福利
        const availableBenefits = rules.filter(rule => {
            // 检查等级限制
            if (rule.conditions.levelIds && rule.conditions.levelIds.length > 0) {
                if (!rule.conditions.levelIds.includes(user.levelId)) {
                    return false;
                }
            }
            // 检查成长值限制
            if (rule.conditions.minGrowth && user.growthValue < rule.conditions.minGrowth) {
                return false;
            }
            return true;
        });
        (0, response_1.success)(res, availableBenefits);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/benefits/my - 获取我的福利
router.get('/my', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { status } = req.query;
        const records = await benefits_model_1.BenefitRecord.findByUserId(req.user.userId);
        // 过滤状态
        let filteredRecords = records;
        if (status !== undefined && status !== '') {
            filteredRecords = records.filter(r => r.status === Number(status));
        }
        // 检查并更新过期状态
        const now = new Date();
        for (const record of filteredRecords) {
            if (record.status === 0 && new Date(record.expireAt) < now) {
                if (record._id) {
                    await benefits_model_1.BenefitRecord.updateById(record._id, { status: 3 });
                    record.status = 3;
                }
            }
        }
        (0, response_1.success)(res, filteredRecords);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/benefits/:ruleId/claim - 领取福利
router.post('/:ruleId/claim', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { ruleId } = req.params;
        const rule = await benefits_model_1.BenefitRule.findByRuleId(ruleId);
        if (!rule) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '福利不存在', 404);
        }
        if (rule.status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该福利已下架');
        }
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 检查等级限制
        if (rule.conditions.levelIds && rule.conditions.levelIds.length > 0) {
            if (!rule.conditions.levelIds.includes(user.levelId)) {
                return (0, response_1.error)(res, shared_1.ApiCode.Forbidden, '您的等级不满足领取条件', 403);
            }
        }
        // 检查成长值限制
        if (rule.conditions.minGrowth && user.growthValue < rule.conditions.minGrowth) {
            return (0, response_1.error)(res, shared_1.ApiCode.Forbidden, '您的成长值不满足领取条件', 403);
        }
        // 检查是否已领取过（根据福利类型判断是否可重复领取）
        const existingRecords = await benefits_model_1.BenefitRecord.find({
            userId: user.userId,
            ruleId,
        });
        // 生日福利每年可领一次
        if (rule.type === 'birthday') {
            const thisYear = new Date().getFullYear();
            const thisYearRecords = existingRecords.filter(r => {
                const recordYear = new Date(r.createdAt).getFullYear();
                return recordYear === thisYear;
            });
            if (thisYearRecords.length > 0) {
                return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '今年已领取过生日福利');
            }
        }
        else if (rule.type === 'new_member' || rule.type === 'level_upgrade') {
            // 新会员福利和升级福利只能领一次
            if (existingRecords.length > 0) {
                return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '您已领取过该福利');
            }
        }
        // 计算过期时间
        const expireAt = new Date(Date.now() + rule.validDays * 24 * 60 * 60 * 1000);
        // 创建福利记录
        const record = await benefits_model_1.BenefitRecord.create({
            recordId: (0, uuid_1.v4)(),
            userId: user.userId,
            userNickname: user.nickname,
            ruleId,
            ruleName: rule.name,
            type: rule.type,
            rewardType: rule.rewardType,
            rewardValue: rule.rewardValue,
            rewardUnit: rule.rewardUnit,
            status: 0, // 待领取 -> 实际创建时就是已领取状态
            claimedAt: new Date(),
            expireAt,
        });
        // 如果是积分奖励，直接发放
        if (rule.rewardType === 'points') {
            await user_model_1.User.updatePoints(user.userId, rule.rewardValue);
            // 记录积分流水
            await points_model_1.PointsRecord.create({
                recordId: (0, uuid_1.v4)(),
                userId: user.userId,
                type: 'earn',
                points: rule.rewardValue,
                balance: user.availablePoints + rule.rewardValue,
                source: 'benefit',
                sourceId: record.recordId,
                description: `领取福利: ${rule.name}`,
            });
            // 更新福利记录为已使用
            if (record._id) {
                await benefits_model_1.BenefitRecord.updateById(record._id, {
                    status: 2,
                    usedAt: new Date(),
                });
            }
        }
        else {
            // 其他类型福利更新为已领取
            if (record._id) {
                await benefits_model_1.BenefitRecord.updateById(record._id, { status: 1 });
            }
        }
        (0, response_1.success)(res, {
            recordId: record.recordId,
            message: '领取成功',
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/benefits/:recordId/use - 使用福利
router.post('/:recordId/use', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { recordId } = req.params;
        const record = await benefits_model_1.BenefitRecord.findByRecordId(recordId);
        if (!record) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '福利记录不存在', 404);
        }
        if (record.userId !== req.user.userId) {
            return (0, response_1.error)(res, shared_1.ApiCode.Forbidden, '无权操作此福利', 403);
        }
        if (record.status !== 1) {
            const statusText = {
                0: '待领取',
                2: '已使用',
                3: '已过期',
            };
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, `福利${statusText[record.status] || '状态异常'}，无法使用`);
        }
        // 检查是否过期
        if (new Date() > new Date(record.expireAt)) {
            if (record._id) {
                await benefits_model_1.BenefitRecord.updateById(record._id, { status: 3 });
            }
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '福利已过期');
        }
        // 更新状态为已使用
        if (record._id) {
            await benefits_model_1.BenefitRecord.updateById(record._id, {
                status: 2,
                usedAt: new Date(),
            });
        }
        (0, response_1.success)(res, { message: '使用成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/benefits/birthday - 获取生日福利
router.get('/birthday', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 获取生日福利规则
        const birthdayRules = await benefits_model_1.BenefitRule.findByType('birthday');
        if (birthdayRules.length === 0) {
            return (0, response_1.success)(res, {
                available: false,
                message: '暂无生日福利',
            });
        }
        // 检查用户是否设置了生日
        if (!user.birthday) {
            return (0, response_1.success)(res, {
                available: false,
                needSetBirthday: true,
                message: '请先设置生日',
            });
        }
        // 检查是否是生日月
        const today = new Date();
        const birthday = new Date(user.birthday);
        const isBirthdayMonth = today.getMonth() === birthday.getMonth();
        // 检查今年是否已领取
        const thisYear = today.getFullYear();
        const existingRecords = await benefits_model_1.BenefitRecord.find({
            userId: user.userId,
            type: 'birthday',
        });
        const thisYearRecord = existingRecords.find(r => {
            return new Date(r.createdAt).getFullYear() === thisYear;
        });
        // 过滤出用户等级可领取的福利
        const availableRules = birthdayRules.filter(rule => {
            if (rule.conditions.levelIds && rule.conditions.levelIds.length > 0) {
                return rule.conditions.levelIds.includes(user.levelId);
            }
            return true;
        });
        (0, response_1.success)(res, {
            available: isBirthdayMonth && !thisYearRecord && availableRules.length > 0,
            isBirthdayMonth,
            alreadyClaimed: !!thisYearRecord,
            benefits: availableRules,
            claimedRecord: thisYearRecord,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/benefits/growth - 获取成长福利
router.get('/growth', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 获取成长福利规则
        const growthRules = await benefits_model_1.BenefitRule.findByType('growth');
        // 获取用户已领取的成长福利
        const claimedRecords = await benefits_model_1.BenefitRecord.find({
            userId: user.userId,
            type: 'growth',
        });
        const claimedRuleIds = claimedRecords.map(r => r.ruleId);
        // 返回所有成长福利及领取状态
        const benefits = growthRules.map(rule => ({
            ...rule,
            claimed: claimedRuleIds.includes(rule.ruleId),
            canClaim: user.growthValue >= (rule.conditions.minGrowth || 0) && !claimedRuleIds.includes(rule.ruleId),
        }));
        (0, response_1.success)(res, {
            currentGrowth: user.growthValue,
            benefits,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/benefits/records - 获取福利记录
router.get('/records', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, type, status } = req.query;
        const query = { userId: req.user.userId };
        if (type) {
            query.type = type;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await benefits_model_1.BenefitRecord.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
