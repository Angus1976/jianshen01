import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, paginated } from '../../utils/response';
import { InviteRecord, InviteRule, IInviteRule } from '../../models/referral.model';

const router = Router();

// GET /api/admin/referral/stats - 邀请统计分析
router.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    // 总邀请数
    const totalInvites = await InviteRecord.count({});

    // 已奖励数
    const rewardedInvites = await InviteRecord.count({ status: 1 });

    // 今日邀请数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayInvites = await InviteRecord.count({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // 计算总奖励积分
    const records = await InviteRecord.find({ status: 1 });
    const totalRewardPoints = records.reduce((sum, r) => sum + r.rewardPoints, 0);

    success(res, {
      totalInvites,
      rewardedInvites,
      todayInvites,
      totalRewardPoints,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referral/ranking - 邀请排行榜
router.get('/ranking', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // 获取所有邀请记录并按邀请人分组统计
    const records = await InviteRecord.find({});
    const inviterStats: Record<string, { inviterId: string; inviterNickname: string; count: number }> = {};

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

    success(res, ranking);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referral/rules - 获取邀请规则
router.get('/rules', adminAuthMiddleware, async (req, res, next) => {
  try {
    const rule = await InviteRule.findActiveRule();
    success(res, rule || {});
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/referral/rules - 更新邀请规则
router.put('/rules', adminAuthMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      description,
      inviterReward,
      inviteeReward,
      rewardCondition,
      maxInvitesPerDay,
      maxInvitesTotal,
      status,
    } = req.body;

    let rule = await InviteRule.findActiveRule();

    if (rule) {
      const updateData: Partial<IInviteRule> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (inviterReward !== undefined) updateData.inviterReward = inviterReward;
      if (inviteeReward !== undefined) updateData.inviteeReward = inviteeReward;
      if (rewardCondition !== undefined) updateData.rewardCondition = rewardCondition;
      if (maxInvitesPerDay !== undefined) updateData.maxInvitesPerDay = maxInvitesPerDay;
      if (maxInvitesTotal !== undefined) updateData.maxInvitesTotal = maxInvitesTotal;
      if (status !== undefined) updateData.status = status;

      await InviteRule.updateById(rule._id!, updateData);
    } else {
      rule = await InviteRule.create({
        ruleId: uuid(),
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

    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referral/records - 获取所有邀请记录
router.get('/records', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, inviterId, status } = req.query;

    const query: Record<string, unknown> = {};
    if (inviterId) {
      query.inviterId = inviterId;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await InviteRecord.findPaginated(
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
