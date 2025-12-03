import { get, put } from '@/utils/request';

export interface Feedback {
  _id?: string;
  feedbackId: string;
  userId: string;
  userNickname?: string;
  userAvatar?: string;
  type: 'suggestion' | 'bug' | 'complaint' | 'other';
  content: string;
  images?: string[];
  contact?: string;
  status: number;
  replyContent?: string;
  replyAt?: string;
  replyBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 统计
export const getFeedbackStats = () => {
  return get<{
    total: number;
    byStatus: {
      pending: number;
      processing: number;
      replied: number;
      closed: number;
    };
    byType: {
      suggestion: number;
      bug: number;
      complaint: number;
      other: number;
    };
  }>('/feedback/stats');
};

// 列表
export interface FeedbackListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: number | string;
  keyword?: string;
}

export const getFeedbackList = (params: FeedbackListParams) => {
  return get<PaginatedResult<Feedback>>('/feedback', params);
};

// 详情
export const getFeedbackDetail = (feedbackId: string) => {
  return get<Feedback>(`/feedback/${feedbackId}`);
};

// 回复
export const replyFeedback = (feedbackId: string, data: { replyContent: string }) => {
  return put<{ message: string }>(`/feedback/${feedbackId}/reply`, data);
};

// 更新状态
export const updateFeedbackStatus = (feedbackId: string, data: { status: number }) => {
  return put<{ message: string }>(`/feedback/${feedbackId}/status`, data);
};
