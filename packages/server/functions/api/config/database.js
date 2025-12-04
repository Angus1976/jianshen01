"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initTCB = initTCB;
exports.getDatabase = getDatabase;
exports.getTCBApp = getTCBApp;
exports.connectDatabase = connectDatabase;
const node_sdk_1 = __importDefault(require("@cloudbase/node-sdk"));
const index_1 = __importDefault(require("./index"));
// TCB 应用实例
let app = null;
/**
 * 初始化 TCB
 */
function initTCB() {
    if (app)
        return app;
    // 云函数环境下自动获取环境变量
    if (process.env.TCB_CONTEXT_CNFG) {
        app = node_sdk_1.default.init({
            env: index_1.default.tcb.envId,
        });
    }
    else {
        // 本地开发环境
        app = node_sdk_1.default.init({
            env: index_1.default.tcb.envId,
            secretId: index_1.default.tcb.secretId,
            secretKey: index_1.default.tcb.secretKey,
        });
    }
    console.log('TCB initialized');
    return app;
}
/**
 * 获取数据库实例
 */
function getDatabase() {
    if (!app) {
        initTCB();
    }
    return app.database();
}
/**
 * 获取 TCB 应用实例
 */
function getTCBApp() {
    if (!app) {
        initTCB();
    }
    return app;
}
// 数据库命令简写
exports.db = {
    get command() {
        return getDatabase().command;
    },
    collection(name) {
        return getDatabase().collection(name);
    },
};
// 连接数据库（兼容旧接口）
async function connectDatabase() {
    initTCB();
    console.log('TCB Database connected');
}
exports.default = exports.db;
