import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { MealCategory, FitnessMeal, IMealCategory, IFitnessMeal } from '../../models/meals.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/meals/categories - 获取分类列表
router.get('/categories', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 50, status } = req.query;

    const query: Record<string, unknown> = {};
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await MealCategory.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/meals/categories - 创建分类
router.post('/categories', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { name, description, icon, sortOrder } = req.body;

    if (!name) {
      return error(res, ApiCode.BadRequest, '分类名称不能为空');
    }

    const category = await MealCategory.create({
      categoryId: uuid(),
      name,
      description,
      icon,
      sortOrder: sortOrder || 0,
      status: 1,
    });

    success(res, category, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/meals/categories/:categoryId - 更新分类
router.put('/categories/:categoryId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, sortOrder, status } = req.body;

    const category = await MealCategory.findByCategoryId(categoryId);
    if (!category) {
      return error(res, ApiCode.NotFound, '分类不存在', 404);
    }

    const updateData: Partial<IMealCategory> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (status !== undefined) updateData.status = status;

    await MealCategory.updateById(category._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/meals/categories/:categoryId - 删除分类
router.delete('/categories/:categoryId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await MealCategory.findByCategoryId(categoryId);
    if (!category) {
      return error(res, ApiCode.NotFound, '分类不存在', 404);
    }

    // 检查是否有餐品使用此分类
    const mealCount = await FitnessMeal.count({ categoryId });
    if (mealCount > 0) {
      return error(res, ApiCode.BadRequest, '该分类下有餐品，无法删除');
    }

    await MealCategory.deleteById(category._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/meals - 获取健身餐列表
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, categoryId, status, isRecommended } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      query.name = new RegExp(keyword as string, 'i');
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

    const result = await FitnessMeal.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/meals - 创建健身餐
router.post('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      description,
      coverImage,
      images,
      categoryId,
      calories,
      protein,
      carbs,
      fat,
      ingredients,
      steps,
      cookingTime,
      difficulty,
      tags,
      isRecommended,
      sortOrder,
    } = req.body;

    if (!name || !categoryId) {
      return error(res, ApiCode.BadRequest, '餐品名称和分类不能为空');
    }

    // 获取分类名称
    const category = await MealCategory.findByCategoryId(categoryId);
    if (!category) {
      return error(res, ApiCode.BadRequest, '分类不存在');
    }

    const meal = await FitnessMeal.create({
      mealId: uuid(),
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

    success(res, meal, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/meals/:mealId - 更新健身餐
router.put('/:mealId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const updateFields = req.body;

    const meal = await FitnessMeal.findByMealId(mealId);
    if (!meal) {
      return error(res, ApiCode.NotFound, '餐品不存在', 404);
    }

    const updateData: Partial<IFitnessMeal> = {};
    const allowedFields = [
      'name', 'description', 'coverImage', 'images',
      'calories', 'protein', 'carbs', 'fat',
      'ingredients', 'steps', 'cookingTime', 'difficulty',
      'tags', 'isRecommended', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    // 如果更新分类
    if (updateFields.categoryId && updateFields.categoryId !== meal.categoryId) {
      const category = await MealCategory.findByCategoryId(updateFields.categoryId);
      if (!category) {
        return error(res, ApiCode.BadRequest, '分类不存在');
      }
      updateData.categoryId = updateFields.categoryId;
      updateData.categoryName = category.name;
    }

    await FitnessMeal.updateById(meal._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/meals/:mealId - 删除健身餐
router.delete('/:mealId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { mealId } = req.params;

    const meal = await FitnessMeal.findByMealId(mealId);
    if (!meal) {
      return error(res, ApiCode.NotFound, '餐品不存在', 404);
    }

    await FitnessMeal.deleteById(meal._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/meals/:mealId/status - 更新健身餐状态
router.put('/:mealId/status', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1) {
      return error(res, ApiCode.BadRequest, '状态值无效');
    }

    const meal = await FitnessMeal.findByMealId(mealId);
    if (!meal) {
      return error(res, ApiCode.NotFound, '餐品不存在', 404);
    }

    await FitnessMeal.updateById(meal._id!, { status });
    success(res, { message: status === 1 ? '上架成功' : '下架成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
