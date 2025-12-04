"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const response_1 = require("../utils/response");
const user_model_1 = require("../models/user.model");
const feedback_model_1 = require("../models/feedback.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// 反馈类型配置
const FEEDBACK_TYPES = [
    { value: 'suggestion', label: '功能建议', description: '对产品功能的改进建议' },
    { value: 'bug', label: '问题反馈', description: '使用过程中遇到的问题' },
    { value: 'complaint', label: '投诉', description: '对服务的投诉' },
    { value: 'other', label: '其他', description: '其他类型的反馈' },
];
// GET /api/feedback/types - 获取反馈类型列表 (放在 /:feedbackId 之前)
router.get('/types', async (req, res, next) => {
    try {
        (0, response_1.success)(res, FEEDBACK_TYPES);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/feedback/my - 获取我的反馈列表 (放在 /:feedbackId 之前)
router.get('/my', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query;
        const query = { userId: req.user.userId };
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await feedback_model_1.Feedback.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        // 添加类型标签
        const listWithLabels = result.list.map(item => {
            var _a;
            return ({
                ...item,
                typeLabel: ((_a = FEEDBACK_TYPES.find(t => t.value === item.type)) === null || _a === void 0 ? void 0 : _a.label) || item.type,
            });
        });
        (0, response_1.paginated)(res, listWithLabels, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/feedback/submit - 提交意见反馈
router.post('/submit', auth_middleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { type, content, images = [], contact } = req.body;
        if (!type) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请选择反馈类型');
        }
        if (!FEEDBACK_TYPES.find(t => t.value === type)) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '无效的反馈类型');
        }
        if (!content || content.trim().length === 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请输入反馈内容');
        }
        if (content.length > 1000) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '反馈内容不能超过1000字');
        }
        if (images.length > 9) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '最多上传9张图片');
        }
        const user = await user_model_1.User.findByUserId(req.user.userId);
        if (!user) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '用户不存在', 404);
        }
        const feedback = await feedback_model_1.Feedback.create({
            feedbackId: (0, uuid_1.v4)(),
            userId: user.userId,
            userNickname: user.nickname,
            userPhone: user.phone,
            type,
            content: content.trim(),
            images,
            contact,
            status: 0, // 待处理
        });
        (0, response_1.success)(res, {
            feedbackId: feedback.feedbackId,
            message: '提交成功，我们会尽快处理',
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/feedback/:feedbackId - 获取反馈详情
router.get('/:feedbackId', auth_middleware_1.authMiddleware, async (req, res, next) => {
    var _a;
    try {
        const { feedbackId } = req.params;
        const feedback = await feedback_model_1.Feedback.findByFeedbackId(feedbackId);
        if (!feedback) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '反馈不存在', 404);
        }
        if (feedback.userId !== req.user.userId) {
            return (0, response_1.error)(res, shared_1.ApiCode.Forbidden, '无权查看此反馈', 403);
        }
        (0, response_1.success)(res, {
            ...feedback,
            typeLabel: ((_a = FEEDBACK_TYPES.find(t => t.value === feedback.type)) === null || _a === void 0 ? void 0 : _a.label) || feedback.type,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
