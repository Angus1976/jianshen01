import { get, post, put, del } from '@/utils/request';

export interface PointsProduct {
  _id?: string;
  productId: string;
  name: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  category: string;
  pointsCost: number;
  originalPrice?: number;
  stock: number;
  totalStock: number;
  limitPerUser: number;
  productType: string;
  couponInfo?: object;
  validDays?: number;
  useRules?: string;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeOrder {
  _id?: string;
  odlId?: string;
  orderId: string;
  userId: string;
  userNickname?: string;
  productId: string;
  productName: string;
  coverImage?: string;
  pointsCost: number;
  quantity: number;
  totalPoints: number;
  status: number;
  usedAt?: string;
  useStore?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointsRecord {
  _id?: string;
  recordId: string;
  userId: string;
  userNickname?: string;
  type: 'earn' | 'consume';
  points: number;
  balance: number;
  source: string;
  sourceId?: string;
  description?: string;
  createdAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 商品相关
export interface ProductListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  status?: number | string;
}

export const getProductList = (params: ProductListParams) => {
  return get<PaginatedResult<PointsProduct>>('/points/products', params);
};

export const createProduct = (data: Partial<PointsProduct>) => {
  return post<PointsProduct>('/points/products', data);
};

export const updateProduct = (productId: string, data: Partial<PointsProduct>) => {
  return put<{ message: string }>(`/points/products/${productId}`, data);
};

export const deleteProduct = (productId: string) => {
  return del<{ message: string }>(`/points/products/${productId}`);
};

// 订单相关
export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: number | string;
  userId?: string;
}

export const getOrderList = (params: OrderListParams) => {
  return get<PaginatedResult<ExchangeOrder>>('/points/orders', params);
};

export const verifyOrder = (orderId: string, data: { useStore?: string }) => {
  return put<{ message: string }>(`/points/orders/${orderId}/verify`, data);
};

// 积分流水
export interface RecordListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  source?: string;
  userId?: string;
}

export const getPointsRecords = (params: RecordListParams) => {
  return get<PaginatedResult<PointsRecord>>('/points/records', params);
};

// 积分统计
export const getPointsStats = () => {
  return get<{
    totalEarned: number;
    totalConsumed: number;
    productCount: number;
    totalOrders: number;
    pendingOrders: number;
  }>('/points/stats');
};
