# 🤖 自动化配置脚本使用指南

## 📋 脚本列表

### 1. `scripts/setup-cloudbase.sh` (Bash 脚本)

用于显示手动配置步骤和说明。

#### 使用方法

```bash
# 显示默认配置
bash scripts/setup-cloudbase.sh

# 指定环境 ID
bash scripts/setup-cloudbase.sh -e my-env-id

# 仅配置 HTTP 触发器
bash scripts/setup-cloudbase.sh --http-only

# 仅配置定时触发器
bash scripts/setup-cloudbase.sh --timer-only

# 跳过某些触发器
bash scripts/setup-cloudbase.sh --skip-timer
```

#### 快速开始

```bash
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird
bash scripts/setup-cloudbase.sh
```

### 2. `scripts/setup-cloudbase.py` (Python 脚本)

功能更强大，支持生成 JSON 配置和 curl 测试命令。

#### 使用方法

```bash
# 显示默认配置步骤
python3 scripts/setup-cloudbase.py

# 显示手动配置步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 输出配置 JSON
python3 scripts/setup-cloudbase.py --config-json

# 显示 curl 测试示例
python3 scripts/setup-cloudbase.py --curl-examples

# 仅配置 HTTP
python3 scripts/setup-cloudbase.py --http-only

# 仅配置定时任务
python3 scripts/setup-cloudbase.py --timer-only
```

#### 快速开始

```bash
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird

# 查看帮助
python3 scripts/setup-cloudbase.py --help

# 显示配置步骤
python3 scripts/setup-cloudbase.py

# 获取 curl 测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 获取完整 JSON 配置
python3 scripts/setup-cloudbase.py --config-json
```

---

## 🎯 完整配置流程

### 第一步：运行脚本查看配置

```bash
python3 scripts/setup-cloudbase.py --manual-steps
```

输出会显示详细的手动配置步骤。

### 第二步：在 TCB 控制台配置

按照脚本显示的步骤，在 TCB 控制台添加触发器：

1. 打开 https://console.cloud.tencent.com/tcb
2. 选择环境 `cloud1-4g2aaqb40446a63b`
3. 进入云函数 → `api`
4. 新建 HTTP 触发器
   - 路径: `/api`
   - 方法: GET, POST, PUT, DELETE, OPTIONS
5. 新建定时触发器（可选）
   - Cron: `0 2 * * *`

### 第三步：获取 API 地址

HTTP 触发器配置完成后，会显示访问地址：
```
https://service-xxx.sh.run.tcloudbase.com/release/api
```

### 第四步：测试 API

```bash
# 获取测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 测试登录
curl -X POST 'https://<your-api-url>/api/auth/password-login' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'
```

---

## 📊 脚本命令对比

| 脚本 | 类型 | 功能 | 推荐场景 |
|------|------|------|---------|
| `setup-cloudbase.sh` | Bash | 显示配置步骤 | ✅ 快速参考 |
| `setup-cloudbase.py` | Python | 生成配置和测试 | ✅ 完整配置 |

---

## 🔑 配置 JSON 输出

运行此命令获取完整的配置 JSON：

```bash
python3 scripts/setup-cloudbase.py --config-json
```

### 输出示例

```json
{
  "env_id": "cloud1-4g2aaqb40446a63b",
  "function_name": "api",
  "triggers": {
    "http": {
      "path": "/api",
      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"]
    },
    "daily_cleanup": {
      "cron": "0 2 * * *",
      "argument": {"action": "cleanup_expired_tokens"}
    },
    "hourly_stats": {
      "cron": "0 * * * *",
      "argument": {"action": "update_statistics"}
    },
    "weekly_report": {
      "cron": "0 10 ? * MON",
      "argument": {"action": "weekly_report"}
    },
    "monthly_reset": {
      "cron": "0 0 1 * *",
      "argument": {"action": "monthly_reset"}
    }
  }
}
```

---

## 🧪 API 测试命令

运行此命令获取 curl 测试示例：

```bash
python3 scripts/setup-cloudbase.py --curl-examples
```

### 常用测试

```bash
# 1. 密码登录
curl -X POST 'https://<your-api-url>/api/auth/password-login' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'

# 2. 获取个人信息
curl -X GET 'https://<your-api-url>/api/auth/profile' \
  -H 'Authorization: Bearer {token}'

# 3. 签到
curl -X POST 'https://<your-api-url>/api/checkin' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json'

# 4. 查看日志
tcb fn log api -e cloud1-4g2aaqb40446a63b
```

---

## 💡 常见问题

### Q: 运行脚本提示"凭证未配置"？
**A:** 这是正常的，脚本只需要生成配置。实际部署需要在 TCB 控制台手动操作。

### Q: 如何修改触发器配置？
**A:** 编辑脚本中的 `TRIGGERS_CONFIG` 字典，或在 TCB 控制台直接修改。

### Q: 定时触发器 Cron 表达式如何理解？
**A:** 
- `0 2 * * *` = 每天凌晨 2 点
- `0 * * * *` = 每小时
- `0 10 ? * MON` = 每周一 10 点
- `0 0 1 * *` = 每月 1 号

### Q: 如何添加新的定时任务？
**A:** 在脚本中的 `TRIGGERS_CONFIG` 添加新条目：

```python
"my_trigger": {
    "name": "my_trigger",
    "type": "timer",
    "config": {
        "cron": "0 3 * * *",  # 每天 3 点
        "argument": {"action": "my_action"}
    },
    "description": "我的自定义任务"
}
```

### Q: 如何在代码中处理定时触发？
**A:** 见 `docs/TRIGGER_CONFIG.md` 中的 "在代码中处理定时触发" 部分。

---

## 📚 相关文档

- 完整部署指南: [`docs/DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md)
- 触发器详细配置: [`docs/TRIGGER_CONFIG.md`](./TRIGGER_CONFIG.md)
- 快速参考卡: [`docs/QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)

---

## 🚀 快速命令

```bash
# 查看所有可用命令
python3 scripts/setup-cloudbase.py --help

# 显示手动配置步骤（推荐）
python3 scripts/setup-cloudbase.py --manual-steps

# 获取 API 测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 输出配置 JSON（用于文档）
python3 scripts/setup-cloudbase.py --config-json > cloudbase-config.json

# 使用 Bash 脚本查看
bash scripts/setup-cloudbase.sh --help
```

---

**最后更新**: 2025-12-04 | **状态**: ✅ 脚本就绪
