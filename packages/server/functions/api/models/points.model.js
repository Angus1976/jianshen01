"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeOrder = exports.PointsProduct = exports.PointsRecord = void 0;
const base_repository_1 = require("../utils/base-repository");
class PointsRecordRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('points_records');
    }
    async findByUserId(userId, limit = 20) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return data;
    }
}
exports.PointsRecord = new PointsRecordRepository();
class PointsProductRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('points_products');
    }
    async findByProductId(productId) {
        return this.findOne({ productId });
    }
    async findActiveProducts(category) {
        const query = { status: 1 };
        if (category)
            query.category = category;
        const { data } = await this.collection
            .where(query)
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    async decreaseStock(productId, quantity = 1) {
        var _a;
        const result = await this.collection.where({ productId }).update({
            stock: this.cmd.inc(-quantity),
            updatedAt: new Date(),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.PointsProduct = new PointsProductRepository();
class ExchangeOrderRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('exchange_orders');
    }
    async findByOrderId(orderId) {
        return this.findOne({ orderId });
    }
    async findByUserId(userId) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
    async findByCouponCode(couponCode) {
        return this.findOne({ couponCode });
    }
    async updateStatus(orderId, status) {
        const order = await this.findByOrderId(orderId);
        if (!order)
            return false;
        return this.updateById(order._id, { status });
    }
}
exports.ExchangeOrder = new ExchangeOrderRepository();
