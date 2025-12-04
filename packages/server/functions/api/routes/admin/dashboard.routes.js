"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const level_model_1 = require("../../models/level.model");
const database_1 = require("../../config/database");
const router = (0, express_1.Router)();
// 安全计数：集合不存在时返回0
async function safeCount(collection, query = {}) {
    var _a;
    try {
        const result = await collection.where(query).count();
        return (_a = result.total) !== null && _a !== void 0 ? _a : 0;
    }
    catch (err) {
        const error = err;
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST' ||
            error.code === 'ResourceNotFound') {
            return 0;
        }
        throw err;
    }
}
// 安全查询：集合不存在时返回空数组
async function safeQuery(collection, query = {}) {
    try {
        const { data } = await collection.where(query).get();
        return data;
    }
    catch (err) {
        const error = err;
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST' ||
            error.code === 'ResourceNotFound') {
            return [];
        }
        throw err;
    }
}
// 安全查询带排序和限制
async function safeQueryWithOrder(collection, orderField, orderDir, limit) {
    try {
        const { data } = await collection.orderBy(orderField, orderDir).limit(limit).get();
        return data;
    }
    catch (err) {
        const error = err;
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST' ||
            error.code === 'ResourceNotFound') {
            return [];
        }
        throw err;
    }
}
// GET /api/admin/dashboard/stats - 获取仪表盘统计数据
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // 获取今天的日期范围
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // 活跃会员：最近7天有登录的
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // 会员统计
        const [totalMembers, todayNewMembers, activeMembers] = await Promise.all([
            safeCount(database_1.db.collection('users'), {}),
            safeCount(database_1.db.collection('users'), {
                createdAt: database_1.db.command.gte(today).and(database_1.db.command.lt(tomorrow)),
            }),
            safeCount(database_1.db.collection('users'), {
                lastLoginAt: database_1.db.command.gte(sevenDaysAgo),
            }),
        ]);
        // 积分统计
        const [earnRecords, consumeRecords, todayEarnRecords, todayConsumeRecords] = await Promise.all([
            safeQuery(database_1.db.collection('points_records'), { type: 'earn' }),
            safeQuery(database_1.db.collection('points_records'), { type: 'consume' }),
            safeQuery(database_1.db.collection('points_records'), {
                type: 'earn',
                createdAt: database_1.db.command.gte(today).and(database_1.db.command.lt(tomorrow)),
            }),
            safeQuery(database_1.db.collection('points_records'), {
                type: 'consume',
                createdAt: database_1.db.command.gte(today).and(database_1.db.command.lt(tomorrow)),
            }),
        ]);
        const totalEarned = earnRecords.reduce((sum, r) => sum + Math.abs(r.points), 0);
        const totalConsumed = consumeRecords.reduce((sum, r) => sum + Math.abs(r.points), 0);
        const todayEarned = todayEarnRecords.reduce((sum, r) => sum + Math.abs(r.points), 0);
        const todayConsumed = todayConsumeRecords.reduce((sum, r) => sum + Math.abs(r.points), 0);
        // 打卡统计
        const [totalCheckins, todayCheckins, pendingCheckins] = await Promise.all([
            safeCount(database_1.db.collection('checkin_records'), {}),
            safeCount(database_1.db.collection('checkin_records'), {
                createdAt: database_1.db.command.gte(today).and(database_1.db.command.lt(tomorrow)),
            }),
            safeCount(database_1.db.collection('checkin_records'), { reviewStatus: 0 }),
        ]);
        // 订单统计
        const [totalOrders, pendingOrders] = await Promise.all([
            safeCount(database_1.db.collection('exchange_orders'), {}),
            safeCount(database_1.db.collection('exchange_orders'), { status: 0 }),
        ]);
        (0, response_1.success)(res, {
            members: {
                total: totalMembers,
                todayNew: todayNewMembers,
                active: activeMembers,
            },
            points: {
                totalEarned,
                totalConsumed,
                todayEarned,
                todayConsumed,
            },
            checkin: {
                total: totalCheckins,
                today: todayCheckins,
                pending: pendingCheckins,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/dashboard/member-growth - 获取会员增长趋势
router.get('/member-growth', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        const daysNum = Number(days);
        const result = [];
        for (let i = daysNum - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const count = await safeCount(database_1.db.collection('users'), {
                createdAt: database_1.db.command.gte(date).and(database_1.db.command.lt(nextDate)),
            });
            result.push({
                date: date.toISOString().split('T')[0],
                count,
            });
        }
        (0, response_1.success)(res, result);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/dashboard/level-distribution - 获取等级分布
router.get('/level-distribution', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // 获取所有等级规则
        let levels = [];
        try {
            levels = await level_model_1.LevelRule.findActiveRules();
        }
        catch (err) {
            const error = err;
            if (error.code !== 'DATABASE_COLLECTION_NOT_EXIST' &&
                error.code !== 'ResourceNotFound') {
                throw err;
            }
        }
        const totalMembers = await safeCount(database_1.db.collection('users'), {});
        const result = await Promise.all(levels.map(async (level) => {
            const count = await safeCount(database_1.db.collection('users'), { levelId: level.levelId });
            return {
                levelId: level.levelId,
                levelName: level.name,
                count,
                percentage: totalMembers > 0 ? Math.round((count / totalMembers) * 100 * 100) / 100 : 0,
            };
        }));
        (0, response_1.success)(res, result);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/dashboard/checkin-ranking - 获取打卡排行榜
router.get('/checkin-ranking', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Number(limit);
        // 获取打卡次数最多的用户
        const users = await safeQueryWithOrder(database_1.db.collection('users'), 'totalCheckins', 'desc', limitNum);
        const result = users.map((user) => ({
            userId: user.userId,
            nickname: user.nickname,
            avatar: user.avatar,
            totalCheckins: user.totalCheckins || 0,
            consecutiveCheckins: user.consecutiveCheckins || 0,
        }));
        (0, response_1.success)(res, result);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/dashboard/points-flow - 获取积分流动数据
router.get('/points-flow', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        const daysNum = Number(days);
        const result = [];
        for (let i = daysNum - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            // 获取当天获得和消耗的积分
            const [earnData, consumeData] = await Promise.all([
                safeQuery(database_1.db.collection('points_records'), {
                    type: 'earn',
                    createdAt: database_1.db.command.gte(date).and(database_1.db.command.lt(nextDate)),
                }),
                safeQuery(database_1.db.collection('points_records'), {
                    type: 'consume',
                    createdAt: database_1.db.command.gte(date).and(database_1.db.command.lt(nextDate)),
                }),
            ]);
            const earned = earnData.reduce((sum, r) => sum + Math.abs(r.points), 0);
            const consumed = consumeData.reduce((sum, r) => sum + Math.abs(r.points), 0);
            result.push({
                date: date.toISOString().split('T')[0],
                earned,
                consumed,
            });
        }
        (0, response_1.success)(res, result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
