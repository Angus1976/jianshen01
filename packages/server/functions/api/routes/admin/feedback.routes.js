"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const feedback_model_1 = require("../../models/feedback.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/feedback/stats - 反馈统计 (必须在 /:feedbackId 之前)
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const totalFeedback = await feedback_model_1.Feedback.count({});
        const pendingFeedback = await feedback_model_1.Feedback.count({ status: 0 });
        const processingFeedback = await feedback_model_1.Feedback.count({ status: 1 });
        const repliedFeedback = await feedback_model_1.Feedback.count({ status: 2 });
        const closedFeedback = await feedback_model_1.Feedback.count({ status: 3 });
        // 按类型统计
        const suggestionCount = await feedback_model_1.Feedback.count({ type: 'suggestion' });
        const bugCount = await feedback_model_1.Feedback.count({ type: 'bug' });
        const complaintCount = await feedback_model_1.Feedback.count({ type: 'complaint' });
        const otherCount = await feedback_model_1.Feedback.count({ type: 'other' });
        (0, response_1.success)(res, {
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/feedback - 获取反馈列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, type, status, keyword } = req.query;
        const query = {};
        if (type) {
            query.type = type;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        if (keyword) {
            query.content = new RegExp(keyword, 'i');
        }
        const result = await feedback_model_1.Feedback.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/feedback/:feedbackId - 获取反馈详情
router.get('/:feedbackId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const feedback = await feedback_model_1.Feedback.findByFeedbackId(feedbackId);
        if (!feedback) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '反馈不存在', 404);
        }
        (0, response_1.success)(res, feedback);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/feedback/:feedbackId/reply - 回复反馈
router.put('/:feedbackId/reply', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const { replyContent } = req.body;
        if (!replyContent) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '回复内容不能为空');
        }
        const feedback = await feedback_model_1.Feedback.findByFeedbackId(feedbackId);
        if (!feedback) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '反馈不存在', 404);
        }
        await feedback_model_1.Feedback.updateById(feedback._id, {
            replyContent,
            replyAt: new Date(),
            replyBy: req.admin.adminId,
            status: 2, // 已回复
        });
        (0, response_1.success)(res, { message: '回复成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/feedback/:feedbackId/status - 更新反馈状态
router.put('/:feedbackId/status', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const { status } = req.body;
        if (![0, 1, 2, 3].includes(status)) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '状态值无效');
        }
        const feedback = await feedback_model_1.Feedback.findByFeedbackId(feedbackId);
        if (!feedback) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '反馈不存在', 404);
        }
        await feedback_model_1.Feedback.updateById(feedback._id, { status });
        const statusText = {
            0: '待处理',
            1: '处理中',
            2: '已回复',
            3: '已关闭',
        };
        (0, response_1.success)(res, { message: `状态已更新为: ${statusText[status]}` });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
