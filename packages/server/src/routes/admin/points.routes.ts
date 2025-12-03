import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { PointsProduct, PointsRecord, ExchangeOrder, IPointsProduct } from '../../models/points.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/points/stats - 积分统计
router.get('/stats', adminAuthMiddleware, async (req, res, next) => {
  try {
    // 计算总发放积分
    const earnRecords = await PointsRecord.find({ type: 'earn' });
    const totalEarned = earnRecords.reduce((sum, r) => sum + r.points, 0);

    // 计算总消耗积分
    const consumeRecords = await PointsRecord.find({ type: 'consume' });
    const totalConsumed = Math.abs(consumeRecords.reduce((sum, r) => sum + r.points, 0));

    // 获取商品数量
    const productCount = await PointsProduct.count({ status: 1 });

    // 获取订单统计
    const totalOrders = await ExchangeOrder.count({});
    const pendingOrders = await ExchangeOrder.count({ status: 0 });

    success(res, {
      totalEarned,
      totalConsumed,
      productCount,
      totalOrders,
      pendingOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/points/products - 获取积分商品列表
router.get('/products', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, category, status } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      query.name = new RegExp(keyword as string, 'i');
    }
    if (category) {
      query.category = category;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await PointsProduct.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/points/products - 创建积分商品
router.post('/products', adminAuthMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      description,
      coverImage,
      images,
      category,
      pointsCost,
      originalPrice,
      stock,
      limitPerUser,
      productType,
      couponInfo,
      validDays,
      useRules,
      sortOrder,
    } = req.body;

    if (!name || !pointsCost || !productType) {
      return error(res, ApiCode.BadRequest, '商品名称、积分价格和商品类型不能为空');
    }

    const product = await PointsProduct.create({
      productId: uuid(),
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

    success(res, product, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/points/products/:productId - 更新积分商品
router.put('/products/:productId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updateFields = req.body;

    const product = await PointsProduct.findByProductId(productId);
    if (!product) {
      return error(res, ApiCode.NotFound, '商品不存在', 404);
    }

    const updateData: Partial<IPointsProduct> = {};
    const allowedFields = [
      'name', 'description', 'coverImage', 'images', 'category',
      'pointsCost', 'originalPrice', 'stock', 'limitPerUser',
      'couponInfo', 'validDays', 'useRules', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    await PointsProduct.updateById(product._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/points/products/:productId - 删除积分商品
router.delete('/products/:productId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await PointsProduct.findByProductId(productId);
    if (!product) {
      return error(res, ApiCode.NotFound, '商品不存在', 404);
    }

    await PointsProduct.deleteById(product._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/points/orders - 获取兑换订单列表
router.get('/orders', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, userId } = req.query;

    const query: Record<string, unknown> = {};
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }
    if (userId) {
      query.userId = userId;
    }

    const result = await ExchangeOrder.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/points/orders/:orderId/verify - 核销订单
router.put('/orders/:orderId/verify', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { useStore } = req.body;

    const order = await ExchangeOrder.findByOrderId(orderId);
    if (!order) {
      return error(res, ApiCode.NotFound, '订单不存在', 404);
    }

    if (order.status !== 0) {
      return error(res, ApiCode.BadRequest, '订单状态不允许核销');
    }

    await ExchangeOrder.updateById(order._id!, {
      status: 1,
      usedAt: new Date(),
      useStore: useStore || '',
    });

    success(res, { message: '核销成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/points/records - 获取积分流水
router.get('/records', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, source, userId } = req.query;

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }
    if (source) {
      query.source = source;
    }
    if (userId) {
      query.userId = userId;
    }

    const result = await PointsRecord.findPaginated(
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
