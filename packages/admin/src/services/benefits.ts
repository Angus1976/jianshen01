import { get, post, put, del } from '@/utils/request';

export interface BenefitRule {
  _id?: string;
  benefitId: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  levelRequirement?: number;
  pointsCost?: number;
  value?: string | number;
  validDays?: number;
  useRules?: string;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BenefitRecord {
  _id?: string;
  recordId: string;
  userId: string;
  userNickname?: string;
  benefitId: string;
  benefitName?: string;
  usedAt?: string;
  expireAt?: string;
  status: number;
  createdAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 权益规则
export interface BenefitListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: number | string;
}

export const getBenefitList = (params: BenefitListParams) => {
  return get<PaginatedResult<BenefitRule>>('/benefits/rules', params);
};

export const getBenefitDetail = (benefitId: string) => {
  return get<BenefitRule>(`/benefits/rules/${benefitId}`);
};

export const createBenefit = (data: Partial<BenefitRule>) => {
  return post<BenefitRule>('/benefits/rules', data);
};

export const updateBenefit = (benefitId: string, data: Partial<BenefitRule>) => {
  return put<{ message: string }>(`/benefits/rules/${benefitId}`, data);
};

export const deleteBenefit = (benefitId: string) => {
  return del<{ message: string }>(`/benefits/rules/${benefitId}`);
};

// 权益记录
export interface BenefitRecordParams {
  page?: number;
  pageSize?: number;
  benefitId?: string;
  userId?: string;
  status?: number | string;
}

export const getBenefitRecords = (params: BenefitRecordParams) => {
  return get<PaginatedResult<BenefitRecord>>('/benefits/records', params);
};
