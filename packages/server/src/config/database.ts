import cloudbase from '@cloudbase/node-sdk';
import config from './index';

// TCB 应用实例
let app: ReturnType<typeof cloudbase.init> | null = null;

/**
 * 初始化 TCB
 */
export function initTCB() {
  if (app) return app;

  // 云函数环境下自动获取环境变量
  if (process.env.TCB_CONTEXT_CNFG) {
    app = cloudbase.init({
      env: config.tcb.envId,
    });
  } else {
    // 本地开发环境
    app = cloudbase.init({
      env: config.tcb.envId,
      secretId: config.tcb.secretId,
      secretKey: config.tcb.secretKey,
    });
  }

  console.log('TCB initialized');
  return app;
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!app) {
    initTCB();
  }
  return app!.database();
}

/**
 * 获取 TCB 应用实例
 */
export function getTCBApp() {
  if (!app) {
    initTCB();
  }
  return app!;
}

// 数据库命令简写
export const db = {
  get command() {
    return getDatabase().command;
  },
  collection(name: string) {
    return getDatabase().collection(name);
  },
};

// 连接数据库（兼容旧接口）
export async function connectDatabase(): Promise<void> {
  initTCB();
  console.log('TCB Database connected');
}

export default db;
