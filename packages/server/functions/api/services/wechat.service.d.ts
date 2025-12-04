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
    sex: number;
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
export declare function getH5AuthUrl(redirectUri: string, state?: string, scope?: 'snsapi_base' | 'snsapi_userinfo'): string;
/**
 * 使用 code 换取 access_token 和 openid
 */
export declare function getAccessToken(code: string): Promise<WechatAccessToken | WechatError>;
/**
 * 获取微信用户信息 (scope 为 snsapi_userinfo 时可用)
 */
export declare function getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo | WechatError>;
/**
 * 检查 access_token 是否有效
 */
export declare function checkAccessToken(accessToken: string, openid: string): Promise<boolean>;
/**
 * 刷新 access_token
 */
export declare function refreshAccessToken(refreshToken: string): Promise<WechatAccessToken | WechatError>;
/**
 * 判断是否为错误响应
 */
export declare function isWechatError(data: unknown): data is WechatError;
//# sourceMappingURL=wechat.service.d.ts.map