"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const response_1 = require("../utils/response");
const meals_model_1 = require("../models/meals.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/meals/categories - 获取分类列表
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await meals_model_1.MealCategory.findActiveCategories();
        (0, response_1.success)(res, categories);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/recommended - 获取推荐健身餐 (放在 /:mealId 之前)
router.get('/recommended', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const meals = await meals_model_1.FitnessMeal.findRecommended();
        (0, response_1.success)(res, meals.slice(0, Number(limit)));
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/user/favorites - 获取我的收藏 (放在 /:mealId 之前)
router.get('/user/favorites', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const favorites = await meals_model_1.MealFavorite.findByUserId(req.user.userId);
        // 获取收藏的健身餐详情
        const meals = await Promise.all(favorites.map(async (fav) => {
            const meal = await meals_model_1.FitnessMeal.findByMealId(fav.mealId);
            return meal ? { ...meal, favoriteId: fav.favoriteId, favoritedAt: fav.createdAt } : null;
        }));
        (0, response_1.success)(res, meals.filter(Boolean));
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/list - 获取健身餐列表
router.get('/list', auth_middleware_1.optionalAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, categoryId, keyword, difficulty, tag } = req.query;
        const query = { status: 1 };
        if (categoryId) {
            query.categoryId = categoryId;
        }
        if (difficulty) {
            query.difficulty = Number(difficulty);
        }
        if (tag) {
            query.tags = tag;
        }
        // 关键字搜索需要在应用层处理
        let result = await meals_model_1.FitnessMeal.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        // 如果有关键字，在应用层过滤
        if (keyword) {
            const kw = keyword.toLowerCase();
            result.list = result.list.filter(meal => meal.name.toLowerCase().includes(kw) || meal.description.toLowerCase().includes(kw));
            result.total = result.list.length;
        }
        // 如果用户已登录，标记收藏状态
        if (req.user) {
            const favorites = await meals_model_1.MealFavorite.findByUserId(req.user.userId);
            const favoriteMealIds = new Set(favorites.map(f => f.mealId));
            result.list = result.list.map(meal => ({
                ...meal,
                isFavorited: favoriteMealIds.has(meal.mealId),
            }));
        }
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/:mealId - 获取健身餐详情
router.get('/:mealId', auth_middleware_1.optionalAuthMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const meal = await meals_model_1.FitnessMeal.findByMealId(mealId);
        if (!meal) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '健身餐不存在', 404);
        }
        if (meal.status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '健身餐已下架', 404);
        }
        // 增加浏览量
        await meals_model_1.FitnessMeal.incrementViewCount(mealId);
        // 获取分类信息
        const category = await meals_model_1.MealCategory.findByCategoryId(meal.categoryId);
        // 检查是否已收藏
        let isFavorited = false;
        if (req.user) {
            const favorite = await meals_model_1.MealFavorite.findByUserAndMeal(req.user.userId, mealId);
            isFavorited = !!favorite;
        }
        (0, response_1.success)(res, {
            ...meal,
            viewCount: (meal.viewCount || 0) + 1,
            categoryInfo: category,
            isFavorited,
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/meals/:mealId/favorite - 收藏健身餐
router.post('/:mealId/favorite', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const meal = await meals_model_1.FitnessMeal.findByMealId(mealId);
        if (!meal) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '健身餐不存在', 404);
        }
        // 检查是否已收藏
        const existing = await meals_model_1.MealFavorite.findByUserAndMeal(req.user.userId, mealId);
        if (existing) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '已收藏过该健身餐');
        }
        // 创建收藏记录
        await meals_model_1.MealFavorite.create({
            favoriteId: (0, uuid_1.v4)(),
            userId: req.user.userId,
            mealId,
        });
        // 更新收藏数
        await meals_model_1.FitnessMeal.updateFavoriteCount(mealId, 1);
        (0, response_1.success)(res, { message: '收藏成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/meals/:mealId/favorite - 取消收藏
router.delete('/:mealId/favorite', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const removed = await meals_model_1.MealFavorite.removeByUserAndMeal(req.user.userId, mealId);
        if (!removed) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '未收藏该健身餐', 404);
        }
        // 更新收藏数
        await meals_model_1.FitnessMeal.updateFavoriteCount(mealId, -1);
        (0, response_1.success)(res, { message: '取消收藏成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
