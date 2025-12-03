import { get, post } from '@/utils/request';
import type { InviteRecord, MyInviteCode, InviteStats, IPagination } from '@rocketbird/shared';

// 获取我的邀请码
export const getMyInviteCode = () => {
  return get<MyInviteCode>('/referral/my-code');
};

// 获取邀请统计
export const getInviteStats = () => {
  return get<InviteStats>('/referral/stats');
};

// 获取邀请记录列表
export const getInviteRecords = (params: { page: number; pageSize: number }) => {
  return get<{ list: InviteRecord[]; pagination: IPagination }>('/referral/records', params);
};

// 生成分享海报
export const generateSharePoster = () => {
  return post<{ posterUrl: string; qrcodeUrl: string; inviteCode: string }>('/referral/generate-poster', {});
};

// 获取邀请规则
export const getInviteRules = () => {
  return get<{
    enabled: boolean;
    inviterReward?: number;
    inviteeReward?: number;
    description?: string;
  }>('/referral/rules');
};

// 验证邀请码
export const validateInviteCode = (inviteCode: string) => {
  return post<{
    valid: boolean;
    inviterNickname: string;
    inviterAvatar: string;
    inviteeReward: number;
  }>('/referral/validate-code', { inviteCode });
};
