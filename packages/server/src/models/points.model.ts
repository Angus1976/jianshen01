import { BaseRepository } from '../utils/base-repository';

// 积分流水
export interface IPointsRecord {
  _id?: string;
  recordId: string;
  userId: string;
  type: string; // earn/consume/expire/adjust
  points: number;
  balance: number;
  source: string; // checkin/share/exchange/referral/birthday/growth/admin
  sourceId?: string;
  description: string;
  expireAt?: Date;
  createdAt?: Date;
}

class PointsRecordRepository extends BaseRepository<IPointsRecord> {
  constructor() {
    super('points_records');
  }

  async findByUserId(userId: string, limit = 20): Promise<IPointsRecord[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return data as IPointsRecord[];
  }
}

export const PointsRecord = new PointsRecordRepository();

// 积分商品
export interface IPointsProduct {
  _id?: string;
  productId: string;
  name: string;
  description: string;
  coverImage: string;
  images: string[];
  category: string;
  pointsCost: number;
  originalPrice?: number;
  stock: number;
  totalStock: number;
  limitPerUser: number; // 0=不限制
  productType: string; // coupon/physical/virtual
  couponInfo?: {
    amount: number;
    minAmount: number;
    validDays: number;
  };
  validDays?: number;
  useRules?: string;
  sortOrder: number;
  status: number; // 0下架 1上架
  createdAt?: Date;
  updatedAt?: Date;
}

class PointsProductRepository extends BaseRepository<IPointsProduct> {
  constructor() {
    super('points_products');
  }

  async findByProductId(productId: string): Promise<IPointsProduct | null> {
    return this.findOne({ productId });
  }

  async findActiveProducts(category?: string): Promise<IPointsProduct[]> {
    const query: Record<string, unknown> = { status: 1 };
    if (category) query.category = category;

    const { data } = await this.collection
      .where(query)
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IPointsProduct[];
  }

  async decreaseStock(productId: string, quantity = 1): Promise<boolean> {
    const result = await this.collection.where({ productId }).update({
      stock: this.cmd.inc(-quantity),
      updatedAt: new Date(),
    });
    return (result.updated ?? 0) > 0;
  }
}

export const PointsProduct = new PointsProductRepository();

// 兑换订单
export interface IExchangeOrder {
  _id?: string;
  orderId: string;
  userId: string;
  userPhone?: string;
  productId: string;
  productName: string;
  productType: string;
  coverImage: string;
  pointsCost: number;
  quantity: number;
  totalPoints: number;
  status: number; // 0待使用 1已使用 2已过期 3已取消
  couponCode?: string;
  expireAt?: Date;
  usedAt?: Date;
  useStore?: string;
  deliveryInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class ExchangeOrderRepository extends BaseRepository<IExchangeOrder> {
  constructor() {
    super('exchange_orders');
  }

  async findByOrderId(orderId: string): Promise<IExchangeOrder | null> {
    return this.findOne({ orderId });
  }

  async findByUserId(userId: string): Promise<IExchangeOrder[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IExchangeOrder[];
  }

  async findByCouponCode(couponCode: string): Promise<IExchangeOrder | null> {
    return this.findOne({ couponCode });
  }

  async updateStatus(orderId: string, status: number): Promise<boolean> {
    const order = await this.findByOrderId(orderId);
    if (!order) return false;
    return this.updateById(order._id!, { status } as Partial<IExchangeOrder>);
  }
}

export const ExchangeOrder = new ExchangeOrderRepository();
