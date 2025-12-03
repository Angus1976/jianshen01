import { get } from '@/utils/request';

export interface DashboardStats {
  members: {
    total: number;
    todayNew: number;
    active: number;
  };
  points: {
    totalEarned: number;
    totalConsumed: number;
    todayEarned: number;
    todayConsumed: number;
  };
  checkin: {
    total: number;
    today: number;
    pending: number;
  };
  orders: {
    total: number;
    pending: number;
  };
}

export interface MemberGrowthData {
  date: string;
  count: number;
}

export interface LevelDistribution {
  levelId: string;
  levelName: string;
  count: number;
  percentage: number;
}

export interface CheckinRanking {
  userId: string;
  nickname: string;
  avatar?: string;
  totalCheckins: number;
  consecutiveCheckins: number;
}

// 获取仪表盘统计
export const getDashboardStats = () => {
  return get<DashboardStats>('/dashboard/stats');
};

// 获取会员增长趋势
export const getMemberGrowthTrend = (params?: { days?: number }) => {
  return get<MemberGrowthData[]>('/dashboard/member-growth', params);
};

// 获取等级分布
export const getLevelDistribution = () => {
  return get<LevelDistribution[]>('/dashboard/level-distribution');
};

// 获取打卡排行榜
export const getCheckinRanking = (params?: { limit?: number }) => {
  return get<CheckinRanking[]>('/dashboard/checkin-ranking', params);
};

// 获取积分流动数据
export const getPointsFlow = (params?: { days?: number }) => {
  return get<Array<{ date: string; earned: number; consumed: number }>>('/dashboard/points-flow', params);
};
