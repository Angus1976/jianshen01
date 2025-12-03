import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { LevelRule, ILevelRule } from '../../models/level.model';
import { User } from '../../models/user.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/levels/stats - 等级分布统计 (必须在 /:levelId 之前)
router.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    const levels = await LevelRule.findActiveRules();
    const stats = await Promise.all(
      levels.map(async (level) => {
        const count = await User.count({ levelId: level.levelId });
        return {
          levelId: level.levelId,
          levelName: level.name,
          count,
        };
      })
    );

    const totalUsers = await User.count({});
    success(res, { stats, totalUsers });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/levels - 获取等级规则列表
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;

    const query: Record<string, unknown> = {};
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await LevelRule.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/levels - 创建等级规则
router.post('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { name, code, minGrowth, maxGrowth, icon, color, benefits, sortOrder } = req.body;

    if (!name || !code) {
      return error(res, ApiCode.BadRequest, '等级名称和编码不能为空');
    }

    if (minGrowth === undefined || maxGrowth === undefined) {
      return error(res, ApiCode.BadRequest, '成长值范围不能为空');
    }

    // 检查编码是否已存在
    const existingLevel = await LevelRule.findByCode(code);
    if (existingLevel) {
      return error(res, ApiCode.BadRequest, '等级编码已存在');
    }

    const level = await LevelRule.create({
      levelId: uuid(),
      name,
      code,
      minGrowth,
      maxGrowth,
      icon: icon || '',
      color: color || '#1890ff',
      benefits: benefits || [],
      sortOrder: sortOrder || 0,
      status: 1,
    });

    success(res, level, '创建成功');
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/levels/:levelId - 获取等级详情
router.get('/:levelId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { levelId } = req.params;

    const level = await LevelRule.findByLevelId(levelId);
    if (!level) {
      return error(res, ApiCode.NotFound, '等级不存在', 404);
    }

    success(res, level);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/levels/:levelId - 更新等级规则
router.put('/:levelId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { levelId } = req.params;
    const { name, minGrowth, maxGrowth, icon, color, benefits, sortOrder, status } = req.body;

    const level = await LevelRule.findByLevelId(levelId);
    if (!level) {
      return error(res, ApiCode.NotFound, '等级不存在', 404);
    }

    const updateData: Partial<ILevelRule> = {};
    if (name !== undefined) updateData.name = name;
    if (minGrowth !== undefined) updateData.minGrowth = minGrowth;
    if (maxGrowth !== undefined) updateData.maxGrowth = maxGrowth;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (status !== undefined) updateData.status = status;

    await LevelRule.updateById(level._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/levels/:levelId - 删除等级规则
router.delete('/:levelId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { levelId } = req.params;

    const level = await LevelRule.findByLevelId(levelId);
    if (!level) {
      return error(res, ApiCode.NotFound, '等级不存在', 404);
    }

    // 检查是否有用户在使用此等级
    const usersWithLevel = await User.count({ levelId });
    if (usersWithLevel > 0) {
      return error(res, ApiCode.BadRequest, '该等级下存在用户，无法删除');
    }

    await LevelRule.deleteById(level._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
