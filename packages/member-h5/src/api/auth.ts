import { post, get, put } from '@/utils/request';
import type { IUser } from '@rocketbird/shared';

// 微信登录 (小程序)
export const wechatLogin = (code: string) => {
  return post<{ token: string; userInfo: IUser }>('/auth/wechat-login', { code });
};

// H5 微信登录 - 获取授权 URL
export const getWechatH5AuthUrl = (redirectUri: string, inviteCode?: string) => {
  const params = new URLSearchParams({ redirectUri });
  if (inviteCode) {
    params.append('inviteCode', inviteCode);
  }
  return get<{ authUrl: string }>(`/auth/wechat/h5/url?${params.toString()}`);
};

// H5 微信登录 - 用授权码登录
export const wechatH5Login = (code: string, state?: string) => {
  return post<{ token: string; isNewUser: boolean; userInfo: IUser }>('/auth/wechat/h5/login', {
    code,
    state,
  });
};

// 发送短信验证码
export const sendSms = (phone: string) => {
  return post<{ success: boolean }>('/auth/send-sms', { phone });
};

// 短信登录
export const smsLogin = (phone: string, code: string, inviteCode?: string) => {
  return post<{ token: string; userInfo: IUser }>('/auth/sms-login', { phone, code, inviteCode });
};

// 手机号+密码注册
export const register = (phone: string, password: string, code: string, inviteCode?: string) => {
  return post<{ token: string; userInfo: IUser }>('/auth/register', { phone, password, code, inviteCode });
};

// 手机号+密码登录
export const passwordLogin = (phone: string, password: string) => {
  return post<{ token: string; userInfo: IUser }>('/auth/password-login', { phone, password });
};

// 设置/重置密码
export const setPassword = (phone: string, password: string, code: string) => {
  return put<{ message: string }>('/auth/set-password', { phone, password, code });
};

// 获取用户信息
export const getProfile = () => {
  return get<IUser>('/auth/profile');
};

// 更新用户信息
export const updateProfile = (data: Partial<IUser>) => {
  return put<IUser>('/auth/profile', data);
};
