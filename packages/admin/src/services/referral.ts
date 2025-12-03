import { get, put } from '@/utils/request';

export interface InviteRule {
  _id?: string;
  ruleId: string;
  name: string;
  description?: string;
  inviterReward: number;
  inviteeReward: number;
  rewardCondition: string;
  maxInvitesPerDay: number;
  maxInvitesTotal: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InviteRecord {
  _id?: string;
  recordId: string;
  inviterId: string;
  inviterNickname?: string;
  inviteeId: string;
  inviteeNickname?: string;
  rewardPoints: number;
  status: number;
  createdAt?: string;
}

export interface InviterRanking {
  inviterId: string;
  inviterNickname: string;
  count: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 统计
export const getReferralStats = () => {
  return get<{
    totalInvites: number;
    rewardedInvites: number;
    todayInvites: number;
    totalRewardPoints: number;
  }>('/referral/stats');
};

// 排行榜
export const getReferralRanking = (limit?: number) => {
  return get<InviterRanking[]>('/referral/ranking', { limit });
};

// 规则
export const getReferralRules = () => {
  return get<InviteRule>('/referral/rules');
};

export const updateReferralRules = (data: Partial<InviteRule>) => {
  return put<{ message: string }>('/referral/rules', data);
};

// 记录
export interface ReferralRecordParams {
  page?: number;
  pageSize?: number;
  inviterId?: string;
  status?: number | string;
}

export const getReferralRecords = (params: ReferralRecordParams) => {
  return get<PaginatedResult<InviteRecord>>('/referral/records', params);
};
