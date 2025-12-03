import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { BenefitRule, BenefitRecord, IBenefitRule } from '../../models/benefits.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/benefits/stats - 福利统计
router.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    // 规则数量
    const ruleCount = await BenefitRule.count({ status: 1 });

    // 发放记录统计
    const totalRecords = await BenefitRecord.count({});
    const pendingRecords = await BenefitRecord.count({ status: 0 });
    const claimedRecords = await BenefitRecord.count({ status: 1 });
    const usedRecords = await BenefitRecord.count({ status: 2 });
    const expiredRecords = await BenefitRecord.count({ status: 3 });

    success(res, {
      ruleCount,
      totalRecords,
      pendingRecords,
      claimedRecords,
      usedRecords,
      expiredRecords,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/benefits/rules - 获取福利规则列表
router.get('/rules', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, status } = req.query;

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await BenefitRule.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/benefits/rules - 创建福利规则
router.post('/rules', adminAuthMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      type,
      description,
      rewardType,
      rewardValue,
      rewardUnit,
      conditions,
      validDays,
      autoGrant,
      sortOrder,
    } = req.body;

    if (!name || !type || !rewardType) {
      return error(res, ApiCode.BadRequest, '规则名称、类型和奖励类型不能为空');
    }

    const rule = await BenefitRule.create({
      ruleId: uuid(),
      name,
      type,
      description: description || '',
      rewardType,
      rewardValue: rewardValue || 0,
      rewardUnit: rewardUnit || '',
      conditions: conditions || {},
      validDays: validDays || 30,
      autoGrant: autoGrant || false,
      sortOrder: sortOrder || 0,
      status: 1,
    });

    success(res, rule, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/benefits/rules/:ruleId - 更新福利规则
router.put('/rules/:ruleId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    const updateFields = req.body;

    const rule = await BenefitRule.findByRuleId(ruleId);
    if (!rule) {
      return error(res, ApiCode.NotFound, '规则不存在', 404);
    }

    const updateData: Partial<IBenefitRule> = {};
    const allowedFields = [
      'name', 'description', 'rewardType', 'rewardValue',
      'rewardUnit', 'conditions', 'validDays', 'autoGrant', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    await BenefitRule.updateById(rule._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/benefits/rules/:ruleId - 删除福利规则
router.delete('/rules/:ruleId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { ruleId } = req.params;

    const rule = await BenefitRule.findByRuleId(ruleId);
    if (!rule) {
      return error(res, ApiCode.NotFound, '规则不存在', 404);
    }

    await BenefitRule.deleteById(rule._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/benefits/records - 获取福利发放记录
router.get('/records', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, ruleId, type, status, userId } = req.query;

    const query: Record<string, unknown> = {};
    if (ruleId) {
      query.ruleId = ruleId;
    }
    if (type) {
      query.type = type;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }
    if (userId) {
      query.userId = userId;
    }

    const result = await BenefitRecord.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

export default router;
