/**
 * 微信服务 - H5 网页授权
 * 文档: https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
 */
import { config } from '../config';

export interface WechatAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}

export interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number; // 1=男, 2=女, 0=未知
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export interface WechatError {
  errcode: number;
  errmsg: string;
}

/**
 * 生成 H5 微信授权 URL
 * @param redirectUri 授权后重定向的回调地址
 * @param state 自定义参数，会在回调时原样返回
 * @param scope snsapi_base(静默授权) 或 snsapi_userinfo(需用户确认)
 */
export function getH5AuthUrl(
  redirectUri: string,
  state: string = '',
  scope: 'snsapi_base' | 'snsapi_userinfo' = 'snsapi_userinfo'
): string {
  const appId = config.wechat.appId;
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
}

/**
 * 使用 code 换取 access_token 和 openid
 */
export async function getAccessToken(code: string): Promise<WechatAccessToken | WechatError> {
  const appId = config.wechat.appId;
  const appSecret = config.wechat.appSecret;

  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as WechatAccessToken | WechatError;
    return data;
  } catch (err) {
    console.error('获取微信 access_token 失败:', err);
    return { errcode: -1, errmsg: '网络请求失败' };
  }
}

/**
 * 获取微信用户信息 (scope 为 snsapi_userinfo 时可用)
 */
export async function getUserInfo(
  accessToken: string,
  openid: string
): Promise<WechatUserInfo | WechatError> {
  const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as WechatUserInfo | WechatError;
    return data;
  } catch (err) {
    console.error('获取微信用户信息失败:', err);
    return { errcode: -1, errmsg: '网络请求失败' };
  }
}

/**
 * 检查 access_token 是否有效
 */
export async function checkAccessToken(accessToken: string, openid: string): Promise<boolean> {
  const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openid}`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as { errcode?: number };
    return data.errcode === 0;
  } catch {
    return false;
  }
}

/**
 * 刷新 access_token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<WechatAccessToken | WechatError> {
  const appId = config.wechat.appId;
  const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as WechatAccessToken | WechatError;
    return data;
  } catch (err) {
    console.error('刷新微信 access_token 失败:', err);
    return { errcode: -1, errmsg: '网络请求失败' };
  }
}

/**
 * 判断是否为错误响应
 */
export function isWechatError(data: unknown): data is WechatError {
  return typeof data === 'object' && data !== null && 'errcode' in data && (data as WechatError).errcode !== 0;
}
