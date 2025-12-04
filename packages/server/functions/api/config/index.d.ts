/**
 * 服务端配置
 * 使用 getter 确保在 dotenv 加载后才读取环境变量
 */
export declare const config: {
    readonly env: string;
    readonly port: number;
    jwt: {
        readonly secret: string;
        readonly adminSecret: string;
        accessTokenExpire: string;
        refreshTokenExpire: string;
    };
    tcb: {
        readonly envId: string;
        readonly secretId: string;
        readonly secretKey: string;
    };
    wechat: {
        readonly appId: string;
        readonly appSecret: string;
    };
    sms: {
        readonly signName: string;
        readonly templateId: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map