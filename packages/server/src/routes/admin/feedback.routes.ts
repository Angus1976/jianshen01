import { Router } from 'express';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { Feedback } from '../../models/feedback.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/feedback/stats - 反馈统计 (必须在 /:feedbackId 之前)
router.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    const totalFeedback = await Feedback.count({});
    const pendingFeedback = await Feedback.count({ status: 0 });
    const processingFeedback = await Feedback.count({ status: 1 });
    const repliedFeedback = await Feedback.count({ status: 2 });
    const closedFeedback = await Feedback.count({ status: 3 });

    // 按类型统计
    const suggestionCount = await Feedback.count({ type: 'suggestion' });
    const bugCount = await Feedback.count({ type: 'bug' });
    const complaintCount = await Feedback.count({ type: 'complaint' });
    const otherCount = await Feedback.count({ type: 'other' });

    success(res, {
      total: totalFeedback,
      byStatus: {
        pending: pendingFeedback,
        processing: processingFeedback,
        replied: repliedFeedback,
        closed: closedFeedback,
      },
      byType: {
        suggestion: suggestionCount,
        bug: bugCount,
        complaint: complaintCount,
        other: otherCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/feedback - 获取反馈列表
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, status, keyword } = req.query;

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }
    if (keyword) {
      query.content = new RegExp(keyword as string, 'i');
    }

    const result = await Feedback.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/feedback/:feedbackId - 获取反馈详情
router.get('/:feedbackId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByFeedbackId(feedbackId);
    if (!feedback) {
      return error(res, ApiCode.NotFound, '反馈不存在', 404);
    }

    success(res, feedback);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/feedback/:feedbackId/reply - 回复反馈
router.put('/:feedbackId/reply', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const { replyContent } = req.body;

    if (!replyContent) {
      return error(res, ApiCode.BadRequest, '回复内容不能为空');
    }

    const feedback = await Feedback.findByFeedbackId(feedbackId);
    if (!feedback) {
      return error(res, ApiCode.NotFound, '反馈不存在', 404);
    }

    await Feedback.updateById(feedback._id!, {
      replyContent,
      replyAt: new Date(),
      replyBy: req.admin!.adminId,
      status: 2, // 已回复
    });

    success(res, { message: '回复成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/feedback/:feedbackId/status - 更新反馈状态
router.put('/:feedbackId/status', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (![0, 1, 2, 3].includes(status)) {
      return error(res, ApiCode.BadRequest, '状态值无效');
    }

    const feedback = await Feedback.findByFeedbackId(feedbackId);
    if (!feedback) {
      return error(res, ApiCode.NotFound, '反馈不存在', 404);
    }

    await Feedback.updateById(feedback._id!, { status });

    const statusText: Record<number, string> = {
      0: '待处理',
      1: '处理中',
      2: '已回复',
      3: '已关闭',
    };
    success(res, { message: `状态已更新为: ${statusText[status]}` });
  } catch (err) {
    next(err);
  }
});

export default router;
