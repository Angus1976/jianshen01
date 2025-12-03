/**
 * 服务端配置
 */

export const config = {
  // 环境
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'rocketbird-secret-key',
    adminSecret: process.env.JWT_ADMIN_SECRET || 'rocketbird-admin-secret-key',
    accessTokenExpire: '7d',
    refreshTokenExpire: '30d',
  },

  // TCB 云开发
  tcb: {
    envId: process.env.TCB_ENV_ID || '',
    secretId: process.env.TCB_SECRET_ID || '',
    secretKey: process.env.TCB_SECRET_KEY || '',
  },

  // 微信
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  },

  // 短信
  sms: {
    signName: process.env.SMS_SIGN_NAME || '',
    templateId: process.env.SMS_TEMPLATE_ID || '',
  },
};

export default config;
