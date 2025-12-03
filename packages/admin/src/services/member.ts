import { get, put, post } from '@/utils/request';

export interface Member {
  _id?: string;
  odlId?: string;
  odlNo?: string;
  odlOpenId?: string;
  userId: string;
  openId?: string;
  unionId?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  gender?: number;
  birthday?: string;
  province?: string;
  city?: string;
  levelId?: string;
  levelName?: string;
  totalPoints: number;
  availablePoints: number;
  frozenPoints: number;
  growthValue: number;
  totalCheckins: number;
  consecutiveCheckins: number;
  inviteCode?: string;
  inviterId?: string;
  inviterNickname?: string;
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

export interface MemberListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  levelId?: string;
  status?: number | string;
}

// 获取会员列表
export const getMemberList = (params: MemberListParams) => {
  return get<PaginatedResult<Member>>('/members', params);
};

// 获取会员详情
export const getMemberDetail = (userId: string) => {
  return get<Member>(`/members/${userId}`);
};

// 更新会员信息
export const updateMember = (userId: string, data: Partial<Member>) => {
  return put<{ message: string }>(`/members/${userId}`, data);
};

// 调整会员等级
export const adjustMemberLevel = (userId: string, data: { levelId: string; reason?: string }) => {
  return put<{ message: string }>(`/members/${userId}/level`, data);
};

// 调整会员积分
export const adjustMemberPoints = (
  userId: string,
  data: { points: number; type: 'earn' | 'consume'; reason: string }
) => {
  return post<{ message: string }>(`/members/${userId}/points`, data);
};

// 获取会员统计
export const getMemberStats = () => {
  return get<{
    totalMembers: number;
    todayNewMembers: number;
    activeMembers: number;
    totalPoints: number;
  }>('/members/stats');
};

// 导出会员数据
export const exportMembers = (params: MemberListParams) => {
  return get<Member[]>('/members/export', params);
};
