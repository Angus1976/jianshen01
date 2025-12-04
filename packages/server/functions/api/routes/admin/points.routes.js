"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const points_model_1 = require("../../models/points.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/points/stats - 积分统计
router.get('/stats', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // 计算总发放积分
        const earnRecords = await points_model_1.PointsRecord.find({ type: 'earn' });
        const totalEarned = earnRecords.reduce((sum, r) => sum + r.points, 0);
        // 计算总消耗积分
        const consumeRecords = await points_model_1.PointsRecord.find({ type: 'consume' });
        const totalConsumed = Math.abs(consumeRecords.reduce((sum, r) => sum + r.points, 0));
        // 获取商品数量
        const productCount = await points_model_1.PointsProduct.count({ status: 1 });
        // 获取订单统计
        const totalOrders = await points_model_1.ExchangeOrder.count({});
        const pendingOrders = await points_model_1.ExchangeOrder.count({ status: 0 });
        (0, response_1.success)(res, {
            totalEarned,
            totalConsumed,
            productCount,
            totalOrders,
            pendingOrders,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/points/products - 获取积分商品列表
router.get('/products', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, category, status } = req.query;
        const query = {};
        if (keyword) {
            query.name = new RegExp(keyword, 'i');
        }
        if (category) {
            query.category = category;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await points_model_1.PointsProduct.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/points/products - 创建积分商品
router.post('/products', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, description, coverImage, images, category, pointsCost, originalPrice, stock, limitPerUser, productType, couponInfo, validDays, useRules, sortOrder, } = req.body;
        if (!name || !pointsCost || !productType) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '商品名称、积分价格和商品类型不能为空');
        }
        const product = await points_model_1.PointsProduct.create({
            productId: (0, uuid_1.v4)(),
            name,
            description: description || '',
            coverImage: coverImage || '',
            images: images || [],
            category: category || 'default',
            pointsCost,
            originalPrice,
            stock: stock || 0,
            totalStock: stock || 0,
            limitPerUser: limitPerUser || 0,
            productType,
            couponInfo,
            validDays,
            useRules,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, product, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/points/products/:productId - 更新积分商品
router.put('/products/:productId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const updateFields = req.body;
        const product = await points_model_1.PointsProduct.findByProductId(productId);
        if (!product) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '商品不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'name', 'description', 'coverImage', 'images', 'category',
            'pointsCost', 'originalPrice', 'stock', 'limitPerUser',
            'couponInfo', 'validDays', 'useRules', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        await points_model_1.PointsProduct.updateById(product._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/points/products/:productId - 删除积分商品
router.delete('/products/:productId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await points_model_1.PointsProduct.findByProductId(productId);
        if (!product) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '商品不存在', 404);
        }
        await points_model_1.PointsProduct.deleteById(product._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/points/orders - 获取兑换订单列表
router.get('/orders', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status, userId } = req.query;
        const query = {};
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        if (userId) {
            query.userId = userId;
        }
        const result = await points_model_1.ExchangeOrder.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/points/orders/:orderId/verify - 核销订单
router.put('/orders/:orderId/verify', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { useStore } = req.body;
        const order = await points_model_1.ExchangeOrder.findByOrderId(orderId);
        if (!order) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '订单不存在', 404);
        }
        if (order.status !== 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '订单状态不允许核销');
        }
        await points_model_1.ExchangeOrder.updateById(order._id, {
            status: 1,
            usedAt: new Date(),
            useStore: useStore || '',
        });
        (0, response_1.success)(res, { message: '核销成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/points/records - 获取积分流水
router.get('/records', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, type, source, userId } = req.query;
        const query = {};
        if (type) {
            query.type = type;
        }
        if (source) {
            query.source = source;
        }
        if (userId) {
            query.userId = userId;
        }
        const result = await points_model_1.PointsRecord.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
