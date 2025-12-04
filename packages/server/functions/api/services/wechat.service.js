"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getH5AuthUrl = getH5AuthUrl;
exports.getAccessToken = getAccessToken;
exports.getUserInfo = getUserInfo;
exports.checkAccessToken = checkAccessToken;
exports.refreshAccessToken = refreshAccessToken;
exports.isWechatError = isWechatError;
/**
 * 微信服务 - H5 网页授权
 * 文档: https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
 */
const config_1 = require("../config");
/**
 * 生成 H5 微信授权 URL
 * @param redirectUri 授权后重定向的回调地址
 * @param state 自定义参数，会在回调时原样返回
 * @param scope snsapi_base(静默授权) 或 snsapi_userinfo(需用户确认)
 */
function getH5AuthUrl(redirectUri, state = '', scope = 'snsapi_userinfo') {
    const appId = config_1.config.wechat.appId;
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
}
/**
 * 使用 code 换取 access_token 和 openid
 */
async function getAccessToken(code) {
    const appId = config_1.config.wechat.appId;
    const appSecret = config_1.config.wechat.appSecret;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
    try {
        const response = await fetch(url);
        const data = (await response.json());
        return data;
    }
    catch (err) {
        console.error('获取微信 access_token 失败:', err);
        return { errcode: -1, errmsg: '网络请求失败' };
    }
}
/**
 * 获取微信用户信息 (scope 为 snsapi_userinfo 时可用)
 */
async function getUserInfo(accessToken, openid) {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
    try {
        const response = await fetch(url);
        const data = (await response.json());
        return data;
    }
    catch (err) {
        console.error('获取微信用户信息失败:', err);
        return { errcode: -1, errmsg: '网络请求失败' };
    }
}
/**
 * 检查 access_token 是否有效
 */
async function checkAccessToken(accessToken, openid) {
    const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openid}`;
    try {
        const response = await fetch(url);
        const data = (await response.json());
        return data.errcode === 0;
    }
    catch (_a) {
        return false;
    }
}
/**
 * 刷新 access_token
 */
async function refreshAccessToken(refreshToken) {
    const appId = config_1.config.wechat.appId;
    const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`;
    try {
        const response = await fetch(url);
        const data = (await response.json());
        return data;
    }
    catch (err) {
        console.error('刷新微信 access_token 失败:', err);
        return { errcode: -1, errmsg: '网络请求失败' };
    }
}
/**
 * 判断是否为错误响应
 */
function isWechatError(data) {
    return typeof data === 'object' && data !== null && 'errcode' in data && data.errcode !== 0;
}
