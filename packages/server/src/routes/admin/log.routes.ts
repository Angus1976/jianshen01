import { Router } from 'express';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { OperationLog } from '../../models/admin.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/logs/export - 导出操作日志 (必须在 /:logId 之前)
router.get('/export', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId, module, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};
    if (adminId) {
      query.adminId = adminId;
    }
    if (module) {
      query.module = module;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
    }

    const logs = await OperationLog.find(query);

    // 简化导出，返回 JSON 数据
    const exportData = logs.map((log) => ({
      logId: log.logId,
      adminName: log.adminName,
      module: log.module,
      action: log.action,
      content: log.content,
      ip: log.ip,
      createdAt: log.createdAt,
    }));

    success(res, exportData);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/logs - 操作日志查询
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, adminId, module, action, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};
    if (adminId) {
      query.adminId = adminId;
    }
    if (module) {
      query.module = module;
    }
    if (action) {
      query.action = action;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
    }

    const result = await OperationLog.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/logs/:logId - 获取日志详情
router.get('/:logId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { logId } = req.params;

    const log = await OperationLog.findOne({ logId });
    if (!log) {
      return error(res, ApiCode.NotFound, '日志不存在', 404);
    }

    success(res, log);
  } catch (err) {
    next(err);
  }
});

export default router;
