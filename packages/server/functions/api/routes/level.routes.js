"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const response_1 = require("../utils/response");
const user_model_1 = require("../models/user.model");
const level_model_1 = require("../models/level.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/level/current - 获取当前等级信息
router.get('/current', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        // 获取当前等级规则
        const currentLevel = await level_model_1.LevelRule.findByGrowthValue(user.growthValue);
        // 获取下一等级
        const allRules = await level_model_1.LevelRule.findActiveRules();
        const currentIndex = allRules.findIndex(r => r.levelId === (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.levelId));
        const nextLevel = currentIndex >= 0 && currentIndex < allRules.length - 1
            ? allRules[currentIndex + 1]
            : null;
        (0, response_1.success)(res, {
            levelId: (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.levelId) || user.levelId,
            levelName: (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.name) || user.levelName,
            levelCode: currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.code,
            icon: currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.icon,
            color: currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.color,
            benefits: (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.benefits) || [],
            growthValue: user.growthValue,
            minGrowth: (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.minGrowth) || 0,
            maxGrowth: (currentLevel === null || currentLevel === void 0 ? void 0 : currentLevel.maxGrowth) || 0,
            nextLevel: nextLevel ? {
                levelId: nextLevel.levelId,
                levelName: nextLevel.name,
                minGrowth: nextLevel.minGrowth,
                needGrowth: nextLevel.minGrowth - user.growthValue,
            } : null,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/level/rules - 获取等级规则
router.get('/rules', async (req, res, next) => {
    try {
        const rules = await level_model_1.LevelRule.findActiveRules();
        const formattedRules = rules.map(rule => ({
            levelId: rule.levelId,
            name: rule.name,
            code: rule.code,
            minGrowth: rule.minGrowth,
            maxGrowth: rule.maxGrowth,
            icon: rule.icon,
            color: rule.color,
            benefits: rule.benefits,
        }));
        (0, response_1.success)(res, formattedRules);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/level/progress - 获取升级进度
router.get('/progress', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        const allRules = await level_model_1.LevelRule.findActiveRules();
        const currentLevel = await level_model_1.LevelRule.findByGrowthValue(user.growthValue);
        if (!currentLevel || allRules.length === 0) {
            return (0, response_1.success)(res, {
                currentGrowth: user.growthValue,
                currentLevel: null,
                nextLevel: null,
                progress: 0,
                isMaxLevel: true,
            });
        }
        const currentIndex = allRules.findIndex(r => r.levelId === currentLevel.levelId);
        const nextLevel = currentIndex < allRules.length - 1 ? allRules[currentIndex + 1] : null;
        // 计算进度百分比
        let progress = 100;
        if (nextLevel) {
            const levelRange = currentLevel.maxGrowth - currentLevel.minGrowth;
            const userProgress = user.growthValue - currentLevel.minGrowth;
            progress = levelRange > 0 ? Math.min(100, Math.floor((userProgress / levelRange) * 100)) : 0;
        }
        (0, response_1.success)(res, {
            currentGrowth: user.growthValue,
            currentLevel: {
                levelId: currentLevel.levelId,
                name: currentLevel.name,
                icon: currentLevel.icon,
                color: currentLevel.color,
                minGrowth: currentLevel.minGrowth,
                maxGrowth: currentLevel.maxGrowth,
            },
            nextLevel: nextLevel ? {
                levelId: nextLevel.levelId,
                name: nextLevel.name,
                icon: nextLevel.icon,
                color: nextLevel.color,
                minGrowth: nextLevel.minGrowth,
                needGrowth: nextLevel.minGrowth - user.growthValue,
            } : null,
            progress,
            isMaxLevel: !nextLevel,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/level/history - 获取等级变动历史
router.get('/history', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const logs = await level_model_1.LevelChangeLog.findByUserId(req.user.userId);
        // 手动分页
        const total = logs.length;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize);
        const paginatedLogs = logs.slice(start, end);
        const formattedLogs = paginatedLogs.map(log => ({
            logId: log.logId,
            beforeLevel: {
                levelId: log.beforeLevelId,
                name: log.beforeLevelName,
            },
            afterLevel: {
                levelId: log.afterLevelId,
                name: log.afterLevelName,
            },
            changeType: log.changeType,
            reason: log.reason,
            createdAt: log.createdAt,
        }));
        (0, response_1.paginated)(res, formattedLogs, total, Number(page), Number(pageSize));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
