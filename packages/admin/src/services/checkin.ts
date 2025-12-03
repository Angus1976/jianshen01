import { get, post, put, del } from '@/utils/request';

export interface CheckinTheme {
  _id?: string;
  themeId: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  rewardPoints: number;
  consecutiveRewards?: Array<{ days: number; points: number }>;
  requiredPhotos: number;
  requiredContent: boolean;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckinRecord {
  _id?: string;
  odlId?: string;
  recordId: string;
  userId: string;
  userNickname?: string;
  userAvatar?: string;
  themeId: string;
  themeName?: string;
  content?: string;
  images?: string[];
  location?: string;
  rewardPoints: number;
  status: number;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  createdAt?: string;
}

export interface ShareRule {
  _id?: string;
  ruleId: string;
  name: string;
  description?: string;
  rewardPoints: number;
  dailyLimit: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 主题相关
export interface ThemeListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
}

export const getThemeList = (params: ThemeListParams) => {
  return get<PaginatedResult<CheckinTheme>>('/checkin/themes', params);
};

export const getThemeDetail = (themeId: string) => {
  return get<CheckinTheme>(`/checkin/themes/${themeId}`);
};

export const createTheme = (data: Partial<CheckinTheme>) => {
  return post<CheckinTheme>('/checkin/themes', data);
};

export const updateTheme = (themeId: string, data: Partial<CheckinTheme>) => {
  return put<{ message: string }>(`/checkin/themes/${themeId}`, data);
};

export const deleteTheme = (themeId: string) => {
  return del<{ message: string }>(`/checkin/themes/${themeId}`);
};

// 记录相关
export interface RecordListParams {
  page?: number;
  pageSize?: number;
  themeId?: string;
  userId?: string;
  status?: number | string;
  startDate?: string;
  endDate?: string;
}

export const getCheckinRecords = (params: RecordListParams) => {
  return get<PaginatedResult<CheckinRecord>>('/checkin/records', params);
};

export const reviewCheckinRecord = (
  recordId: string,
  data: { status: number; rejectReason?: string }
) => {
  return put<{ message: string }>(`/checkin/records/${recordId}/review`, data);
};

// 分享规则
export const getShareRules = () => {
  return get<ShareRule>('/checkin/share-rules');
};

export const updateShareRules = (data: Partial<ShareRule>) => {
  return put<{ message: string }>('/checkin/share-rules', data);
};

// 统计
export const getCheckinStats = () => {
  return get<{
    totalCheckins: number;
    todayCheckins: number;
    pendingReview: number;
    totalThemes: number;
    activeThemes: number;
  }>('/checkin/stats');
};
