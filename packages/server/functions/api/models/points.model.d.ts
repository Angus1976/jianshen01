import { BaseRepository } from '../utils/base-repository';
export interface IPointsRecord {
    _id?: string;
    recordId: string;
    userId: string;
    type: string;
    points: number;
    balance: number;
    source: string;
    sourceId?: string;
    description: string;
    expireAt?: Date;
    createdAt?: Date;
}
declare class PointsRecordRepository extends BaseRepository<IPointsRecord> {
    constructor();
    findByUserId(userId: string, limit?: number): Promise<IPointsRecord[]>;
}
export declare const PointsRecord: PointsRecordRepository;
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
    limitPerUser: number;
    productType: string;
    couponInfo?: {
        amount: number;
        minAmount: number;
        validDays: number;
    };
    validDays?: number;
    useRules?: string;
    sortOrder: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class PointsProductRepository extends BaseRepository<IPointsProduct> {
    constructor();
    findByProductId(productId: string): Promise<IPointsProduct | null>;
    findActiveProducts(category?: string): Promise<IPointsProduct[]>;
    decreaseStock(productId: string, quantity?: number): Promise<boolean>;
}
export declare const PointsProduct: PointsProductRepository;
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
    status: number;
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
declare class ExchangeOrderRepository extends BaseRepository<IExchangeOrder> {
    constructor();
    findByOrderId(orderId: string): Promise<IExchangeOrder | null>;
    findByUserId(userId: string): Promise<IExchangeOrder[]>;
    findByCouponCode(couponCode: string): Promise<IExchangeOrder | null>;
    updateStatus(orderId: string, status: number): Promise<boolean>;
}
export declare const ExchangeOrder: ExchangeOrderRepository;
export {};
//# sourceMappingURL=points.model.d.ts.map