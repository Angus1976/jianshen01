# 🔧 TCB 云函数触发器配置指南

## 1. HTTP 触发器（用于 API 服务）

### JSON 格式配置

```json
{
  "Type": "Http",
  "Properties": {
    "HttpPath": "/api",
    "HttpMethod": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
      "HEAD"
    ],
    "IsIntegratedResponse": true
  }
}
```

### CloudFormation 模板格式

```yaml
ApiTrigger:
  Type: AWS::CloudBase::Function::HttpTrigger
  Properties:
    FunctionName: api
    HttpPath: /api
    HttpMethod:
      - GET
      - POST
      - PUT
      - DELETE
      - OPTIONS
      - HEAD
    IsIntegratedResponse: true
```

### TCB CLI 命令创建

```bash
# 使用 tcb 命令行创建 HTTP 触发器
tcb fn trigger create api \
  --type http \
  --method GET,POST,PUT,DELETE,OPTIONS,HEAD \
  --path /api
```

---

## 2. 定时触发器（定期执行任务）

### 2.1 每天定时执行

用途: 每天凌晨2点执行数据清理

```json
{
  "Type": "Timer",
  "Properties": {
    "CronExpression": "0 2 * * *",
    "Enable": true,
    "Argument": {
      "action": "daily_cleanup"
    }
  }
}
```

### 2.2 每小时执行一次

用途: 每小时更新缓存

```json
{
  "Type": "Timer",
  "Properties": {
    "CronExpression": "0 * * * *",
    "Enable": true,
    "Argument": {
      "action": "update_cache"
    }
  }
}
```

### 2.3 每周一定时执行

用途: 每周一早上10点生成周报

```json
{
  "Type": "Timer",
  "Properties": {
    "CronExpression": "0 10 ? * MON",
    "Enable": true,
    "Argument": {
      "action": "weekly_report"
    }
  }
}
```

### 2.4 每月1号执行

用途: 每月初重置等级数据

```json
{
  "Type": "Timer",
  "Properties": {
    "CronExpression": "0 0 1 * *",
    "Enable": true,
    "Argument": {
      "action": "monthly_reset"
    }
  }
}
```

### 2.5 每5分钟执行一次

用途: 实时监控和告警

```json
{
  "Type": "Timer",
  "Properties": {
    "CronExpression": "*/5 * * * *",
    "Enable": true,
    "Argument": {
      "action": "health_check"
    }
  }
}
```

---

## 3. Cron 表达式详解

### 格式

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日期 (1-31) 或 ? (任意)
│ │ │ ┌───────────── 月份 (1-12)
│ │ │ │ ┌───────────── 星期几 (0-6，0=周日) 或 MON-SUN
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### 常见表达式

| 表达式 | 说明 |
|--------|------|
| `0 0 * * *` | 每天午夜 (0:00) |
| `0 2 * * *` | 每天凌晨2点 |
| `0 10 ? * MON` | 每周一上午10点 |
| `0 0 1 * *` | 每月1号午夜 |
| `*/5 * * * *` | 每5分钟 |
| `0 * * * *` | 每小时 |
| `0 0,12 * * *` | 每天 0:00 和 12:00 |
| `0 9-17 * * MON-FRI` | 工作日每小时 |
| `0 0 ? * 1-5` | 周一到周五午夜 |

---

## 4. RocketBird 项目推荐配置

### 方案 A: 完整生产配置

```json
{
  "FunctionName": "api",
  "Triggers": [
    {
      "Type": "Http",
      "Name": "api_http",
      "Properties": {
        "HttpPath": "/api",
        "HttpMethod": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        "IsIntegratedResponse": true
      }
    },
    {
      "Type": "Timer",
      "Name": "daily_cleanup",
      "Properties": {
        "CronExpression": "0 2 * * *",
        "Enable": true,
        "Argument": {
          "action": "cleanup_expired_tokens"
        }
      }
    },
    {
      "Type": "Timer",
      "Name": "hourly_stats",
      "Properties": {
        "CronExpression": "0 * * * *",
        "Enable": true,
        "Argument": {
          "action": "update_statistics"
        }
      }
    }
  ]
}
```

### 方案 B: 最小生产配置

```json
{
  "FunctionName": "api",
  "Triggers": [
    {
      "Type": "Http",
      "Name": "api_http",
      "Properties": {
        "HttpPath": "/api",
        "HttpMethod": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "IsIntegratedResponse": true
      }
    }
  ]
}
```

---

## 5. 在 TCB 控制台配置（UI 操作）

### 步骤 1: 打开云函数

1. 登录 [TCB 控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境 `cloud1-4g2aaqb40446a63b`
3. 左侧菜单 → **云函数**
4. 找到函数 `api` → 点击进入

### 步骤 2: 添加 HTTP 触发器

1. 在函数详情页，点击 **新建触发器**
2. 选择触发器类型: **HTTP**
3. 配置:
   - 请求方法: ✓GET ✓POST ✓PUT ✓DELETE ✓OPTIONS
   - 路径: `/api`
   - 其他选项保持默认
4. 点击 **保存**
5. 系统会显示 HTTP 访问地址，如:
   ```
   https://service-xxx.sh.run.tcloudbase.com/release/api
   ```

### 步骤 3: 添加定时触发器（可选）

1. 再次点击 **新建触发器**
2. 选择触发器类型: **定时任务**
3. 配置:
   - Cron 表达式: `0 2 * * *` (每天凌晨2点)
   - 是否启用: ✓ 启用
4. 点击 **保存**

---

## 6. 在 cloudbaserc.json 配置（自动化方式）

目前 `cloudbaserc.json` 配置简化版本，如需添加触发器，格式如下：

```json
{
  "version": "2.0",
  "envId": "{{env.TCB_ENV_ID}}",
  "framework": {
    "name": "rocketbird-server",
    "plugins": {
      "function": {
        "use": "@cloudbase/framework-plugin-function",
        "inputs": {
          "functions": [
            {
              "name": "api",
              "runtime": "Nodejs12.16",
              "entry": "dist/app.js",
              "memory": 512,
              "timeout": 30,
              "handler": "app.main",
              "installDependency": true
            }
          ]
        }
      }
    }
  }
}
```

**注意**: 由于 CloudBase Framework 对触发器配置的支持有限，推荐在 TCB 控制台通过 UI 手动配置。

---

## 7. 在代码中处理定时触发

### 在 `app.ts` 中添加定时处理

```typescript
import express from 'express';
import { getTCBApp } from './config/database';

const app = express();

// HTTP 请求处理
app.post('/api/auth/login', (req, res) => {
  // API 逻辑
});

// 定时任务处理（在 handler 中判断请求类型）
export const main = async (event: any, context: any) => {
  // 判断是否为定时触发
  if (event.source === 'tcb.timer.trigger') {
    const action = event.data?.action;
    
    switch (action) {
      case 'cleanup_expired_tokens':
        await cleanupExpiredTokens();
        break;
      case 'update_statistics':
        await updateStatistics();
        break;
      default:
        console.log('Unknown timer action:', action);
    }
    
    return { status: 'success', action };
  }
  
  // HTTP 请求处理
  return app(event, context);
};

// 清理过期 Token
async function cleanupExpiredTokens() {
  const db = getTCBApp().database();
  const now = new Date();
  
  await db.collection('users').where({
    tokenExpireAt: db.command.lt(now)
  }).remove();
  
  console.log('Token cleanup completed');
}

// 更新统计数据
async function updateStatistics() {
  const db = getTCBApp().database();
  
  // 更新用户数统计
  const userCount = await db.collection('users').count();
  
  await db.collection('statistics').doc('daily').update({
    totalUsers: userCount.total,
    lastUpdate: new Date()
  });
  
  console.log('Statistics updated');
}
```

---

## 8. 故障排查

### 问题: HTTP 触发器创建后还是 404

**解决方案**:
1. 确认环境 ID 正确
2. 检查触发器是否启用
3. 查看路径配置是否为 `/api`
4. 等待2-3分钟让配置生效

### 问题: 定时任务没有执行

**解决方案**:
1. 确认 Cron 表达式正确
2. 查看云函数日志是否有错误
3. 确保函数启用了定时触发器
4. 检查函数内存和超时时间是否充足

### 问题: 调用 API 返回 502

**解决方案**:
1. 查看云函数日志 (TCB 控制台 > 云函数 > api > 日志)
2. 检查依赖是否正确安装
3. 确认数据库连接正常
4. 增加函数超时时间

---

## 9. 监控和告警

### 查看执行日志

```bash
# 使用 CLI 查看日志
tcb fn log api --limit 100

# 或在控制台查看:
# TCB 控制台 > 云函数 > api > 日志
```

### 查看监控数据

1. TCB 控制台 > 云函数 > api
2. 查看:
   - 调用次数
   - 错误次数
   - 平均时间
   - 内存使用

---

## 总结

| 触发器类型 | 用途 | 配置难度 | 推荐 |
|-----------|------|--------|------|
| **HTTP** | API 服务 | ⭐ 简单 | ✅ 必需 |
| **定时** | 定期任务 | ⭐⭐ 中等 | ⭐ 可选 |
| **COS** | 文件操作 | ⭐⭐ 中等 | ⭐ 可选 |
| **数据库** | 数据变化 | ⭐⭐⭐ 复杂 | ⭐ 可选 |

**下一步**: 打开 TCB 控制台，为 `api` 函数添加 HTTP 触发器 ✨
