"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const meals_model_1 = require("../../models/meals.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/meals/categories - 获取分类列表
router.get('/categories', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 50, status } = req.query;
        const query = {};
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await meals_model_1.MealCategory.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/meals/categories - 创建分类
router.post('/categories', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, icon, sortOrder } = req.body;
        if (!name) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '分类名称不能为空');
        }
        const category = await meals_model_1.MealCategory.create({
            categoryId: (0, uuid_1.v4)(),
            name,
            description,
            icon,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, category, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/meals/categories/:categoryId - 更新分类
router.put('/categories/:categoryId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, sortOrder, status } = req.body;
        const category = await meals_model_1.MealCategory.findByCategoryId(categoryId);
        if (!category) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '分类不存在', 404);
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (icon !== undefined)
            updateData.icon = icon;
        if (sortOrder !== undefined)
            updateData.sortOrder = sortOrder;
        if (status !== undefined)
            updateData.status = status;
        await meals_model_1.MealCategory.updateById(category._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/meals/categories/:categoryId - 删除分类
router.delete('/categories/:categoryId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const category = await meals_model_1.MealCategory.findByCategoryId(categoryId);
        if (!category) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '分类不存在', 404);
        }
        // 检查是否有餐品使用此分类
        const mealCount = await meals_model_1.FitnessMeal.count({ categoryId });
        if (mealCount > 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该分类下有餐品，无法删除');
        }
        await meals_model_1.MealCategory.deleteById(category._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/meals - 获取健身餐列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, categoryId, status, isRecommended } = req.query;
        const query = {};
        if (keyword) {
            query.name = new RegExp(keyword, 'i');
        }
        if (categoryId) {
            query.categoryId = categoryId;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        if (isRecommended !== undefined && isRecommended !== '') {
            query.isRecommended = isRecommended === 'true';
        }
        const result = await meals_model_1.FitnessMeal.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/meals - 创建健身餐
router.post('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, coverImage, images, categoryId, calories, protein, carbs, fat, ingredients, steps, cookingTime, difficulty, tags, isRecommended, sortOrder, } = req.body;
        if (!name || !categoryId) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '餐品名称和分类不能为空');
        }
        // 获取分类名称
        const category = await meals_model_1.MealCategory.findByCategoryId(categoryId);
        if (!category) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '分类不存在');
        }
        const meal = await meals_model_1.FitnessMeal.create({
            mealId: (0, uuid_1.v4)(),
            name,
            description: description || '',
            coverImage: coverImage || '',
            images: images || [],
            categoryId,
            categoryName: category.name,
            calories: calories || 0,
            protein: protein || 0,
            carbs: carbs || 0,
            fat: fat || 0,
            ingredients: ingredients || [],
            steps: steps || [],
            cookingTime: cookingTime || 0,
            difficulty: difficulty || 1,
            tags: tags || [],
            viewCount: 0,
            favoriteCount: 0,
            isRecommended: isRecommended || false,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, meal, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/meals/:mealId - 更新健身餐
router.put('/:mealId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const updateFields = req.body;
        const meal = await meals_model_1.FitnessMeal.findByMealId(mealId);
        if (!meal) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '餐品不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'name', 'description', 'coverImage', 'images',
            'calories', 'protein', 'carbs', 'fat',
            'ingredients', 'steps', 'cookingTime', 'difficulty',
            'tags', 'isRecommended', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        // 如果更新分类
        if (updateFields.categoryId && updateFields.categoryId !== meal.categoryId) {
            const category = await meals_model_1.MealCategory.findByCategoryId(updateFields.categoryId);
            if (!category) {
                return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '分类不存在');
            }
            updateData.categoryId = updateFields.categoryId;
            updateData.categoryName = category.name;
        }
        await meals_model_1.FitnessMeal.updateById(meal._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/meals/:mealId - 删除健身餐
router.delete('/:mealId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const meal = await meals_model_1.FitnessMeal.findByMealId(mealId);
        if (!meal) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '餐品不存在', 404);
        }
        await meals_model_1.FitnessMeal.deleteById(meal._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/meals/:mealId/status - 更新健身餐状态
router.put('/:mealId/status', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { mealId } = req.params;
        const { status } = req.body;
        if (status !== 0 && status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '状态值无效');
        }
        const meal = await meals_model_1.FitnessMeal.findByMealId(mealId);
        if (!meal) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '餐品不存在', 404);
        }
        await meals_model_1.FitnessMeal.updateById(meal._id, { status });
        (0, response_1.success)(res, { message: status === 1 ? '上架成功' : '下架成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
