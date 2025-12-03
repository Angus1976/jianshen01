import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { User, IUser } from '../../models/user.model';
import { LevelRule, LevelChangeLog } from '../../models/level.model';
import { PointsRecord } from '../../models/points.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/members/export - 导出会员数据 (必须在 /:userId 之前)
router.get('/export', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { levelId, status, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};
    if (levelId) query.levelId = levelId;
    if (status !== undefined && status !== '') query.status = Number(status);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
    }

    const users = await User.find(query);

    // 简化导出，返回 JSON 数据，前端可以转换为 CSV/Excel
    const exportData = users.map((user) => ({
      userId: user.userId,
      nickname: user.nickname,
      phone: user.phone || '',
      levelName: user.levelName,
      growthValue: user.growthValue,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      status: user.status === 1 ? '正常' : '禁用',
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));

    success(res, exportData);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/members - 获取会员列表
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, levelId, status } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      // 按昵称或手机号搜索
      query.nickname = new RegExp(keyword as string, 'i');
    }
    if (levelId) {
      query.levelId = levelId;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await User.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/members/:userId - 获取会员详情
router.get('/:userId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '会员不存在', 404);
    }

    // 获取积分记录
    const pointsRecords = await PointsRecord.findByUserId(userId, 10);

    // 获取等级变动记录
    const levelChangeLogs = await LevelChangeLog.findByUserId(userId);

    success(res, {
      ...user,
      pointsRecords,
      levelChangeLogs,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/members/:userId - 更新会员信息
router.put('/:userId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { nickname, phone, birthday, gender } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '会员不存在', 404);
    }

    const updateData: Partial<IUser> = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (birthday !== undefined) updateData.birthday = new Date(birthday);
    if (gender !== undefined) updateData.gender = gender;

    await User.updateById(user._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/members/:userId/status - 更新会员状态
router.put('/:userId/status', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1) {
      return error(res, ApiCode.BadRequest, '状态值无效');
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '会员不存在', 404);
    }

    await User.updateById(user._id!, { status });
    success(res, { message: status === 1 ? '启用成功' : '禁用成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/members/:userId/level - 调整会员等级
router.put('/:userId/level', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { levelId, reason } = req.body;

    if (!levelId) {
      return error(res, ApiCode.BadRequest, '请选择等级');
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '会员不存在', 404);
    }

    const newLevel = await LevelRule.findByLevelId(levelId);
    if (!newLevel) {
      return error(res, ApiCode.BadRequest, '等级不存在');
    }

    // 记录等级变动
    await LevelChangeLog.create({
      logId: uuid(),
      userId,
      beforeLevelId: user.levelId,
      beforeLevelName: user.levelName,
      afterLevelId: levelId,
      afterLevelName: newLevel.name,
      changeType: 'manual',
      reason: reason || '管理员手动调整',
      operatorId: req.admin!.adminId,
      operatorName: req.admin!.username,
    });

    // 更新用户等级
    await User.updateLevel(userId, levelId, newLevel.name);

    success(res, { message: '等级调整成功' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/members/:userId/points - 调整会员积分
router.post('/:userId/points', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || points === 0) {
      return error(res, ApiCode.BadRequest, '请输入调整积分数');
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '会员不存在', 404);
    }

    // 检查扣减积分是否足够
    if (points < 0 && user.availablePoints + points < 0) {
      return error(res, ApiCode.BadRequest, '可用积分不足');
    }

    // 更新积分
    await User.updatePoints(userId, points);

    // 记录积分流水
    await PointsRecord.create({
      recordId: uuid(),
      userId,
      type: points > 0 ? 'earn' : 'consume',
      points,
      balance: user.availablePoints + points,
      source: 'admin',
      description: reason || (points > 0 ? '管理员增加积分' : '管理员扣减积分'),
    });

    success(res, { message: '积分调整成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
