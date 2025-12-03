import { get, post, put, del } from '@/utils/request';

export interface LevelRule {
  _id?: string;
  levelId: string;
  name: string;
  level: number;
  minGrowth: number;
  maxGrowth?: number;
  icon?: string;
  color?: string;
  benefits?: string[];
  discount?: number;
  pointsMultiplier?: number;
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

export interface LevelListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
}

// 获取等级列表
export const getLevelList = (params: LevelListParams) => {
  return get<PaginatedResult<LevelRule>>('/levels', params);
};

// 获取等级详情
export const getLevelDetail = (levelId: string) => {
  return get<LevelRule>(`/levels/${levelId}`);
};

// 创建等级
export const createLevel = (data: Omit<LevelRule, '_id' | 'levelId' | 'createdAt' | 'updatedAt'>) => {
  return post<LevelRule>('/levels', data);
};

// 更新等级
export const updateLevel = (levelId: string, data: Partial<LevelRule>) => {
  return put<{ message: string }>(`/levels/${levelId}`, data);
};

// 删除等级
export const deleteLevel = (levelId: string) => {
  return del<{ message: string }>(`/levels/${levelId}`);
};

// 获取等级统计
export const getLevelStats = () => {
  return get<{
    totalLevels: number;
    levelDistribution: Array<{ levelId: string; levelName: string; count: number }>;
  }>('/levels/stats');
};
