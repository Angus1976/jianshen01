import { get } from '@/utils/request';
import type { Level, MyLevelInfo } from '@rocketbird/shared';

// 获取所有等级规则列表
export const getLevelList = () => {
  return get<Level[]>('/level/rules');
};

// 获取我的等级信息
export const getMyLevelInfo = () => {
  return get<MyLevelInfo>('/level/current');
};

// 获取升级进度
export const getLevelProgress = () => {
  return get<{
    currentGrowth: number;
    currentLevel: Level | null;
    nextLevel: { levelId: string; name: string; minGrowth: number; needGrowth: number } | null;
    progress: number;
    isMaxLevel: boolean;
  }>('/level/progress');
};

// 获取等级变动历史
export const getLevelHistory = (params: { page: number; pageSize: number }) => {
  return get<{ list: unknown[]; total: number; page: number; pageSize: number }>('/level/history', params);
};
