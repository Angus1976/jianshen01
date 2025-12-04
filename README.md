# 🏋️ RocketBird - 集团化运营级会员端

> 打破门店界限，集团直面会员，为会员提供统一的、品牌化的运营服务和关怀

## 🎯 项目状态

```
✅ 开发完成
✅ 部署完成  
✅ 文档完成
✅ 脚本完成
🟡 配置中 (仅需配置 HTTP 触发器)

总体进度: 90% 完成
```

---

## 📚 文档导航 (重要!)

| 文档 | 用途 | 阅读时间 |
|------|------|---------|
| **[🚀 QUICK_START.md](./QUICK_START.md)** | **30 秒快速开始** | **2 分钟** |
| **[📖 FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** | **完整项目总结** | **15 分钟** |
| **[📦 DELIVERY_CHECKLIST.md](./DELIVERY_CHECKLIST.md)** | **交付清单** | **10 分钟** |
| [📚 docs/README.md](./docs/README.md) | 所有文档索引 | 5 分钟 |
| [📱 docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) | 项目架构详解 | 20 分钟 |
| [🚀 docs/DEPLOYMENT_COMPLETE.md](./docs/DEPLOYMENT_COMPLETE.md) | 部署完整指南 | 20 分钟 |
| [⚙️ docs/TRIGGER_CONFIG.md](./docs/TRIGGER_CONFIG.md) | 触发器配置 | 15 分钟 |
| [⚡ docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) | 快速参考卡 | 5 分钟 |
| [🤖 docs/SCRIPTS_GUIDE.md](./docs/SCRIPTS_GUIDE.md) | 脚本使用指南 | 10 分钟 |
| [✅ docs/CHECKLIST.md](./docs/CHECKLIST.md) | 完成清单 | 10 分钟 |

---

## ⚡ 立即开始 (3 步, 5 分钟)

### 1️⃣ 查看配置

```bash
python3 scripts/setup-cloudbase.py --manual-steps
```

### 2️⃣ 配置 HTTP 触发器

按照上面脚本的输出，在 TCB 控制台操作

### 3️⃣ 访问应用

```
H5:       https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
Admin:    https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/admin
```

**测试账户**: `13800000001` / `123456`

---

## 📱 访问链接

| 应用 | URL | 账户 | 密码 |
|------|-----|------|------|
| **H5 会员端** | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com | 13800000001 | 123456 |
| **管理后台** | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/admin | 13800000001 | 123456 |
| **TCB 控制台** | https://console.cloud.tencent.com/tcb | - | - |

---

## 🔑 关键信息

```
环境 ID:     cloud1-4g2aaqb40446a63b
后端函数:    api
数据库:      TCB 文档数据库
API 路径:    /api
```

---

## 🛠️ 常用命令

```bash
# 查看配置步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 查看 API 测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 查看实时日志
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow

# 部署所有模块
bash scripts/deploy-tcb.sh all

# 本地开发
cd packages/member-h5 && npm run dev    # H5
cd packages/admin && npm run dev        # Admin
cd packages/server && npm run dev       # API
```

---

## 📦 项目简介

RocketBird 是一个为商业健身连锁集团构建的"以会员为中心"的品牌化运营系统。通过打造集团品牌化会员端，实现会员服务、会员关怀和会员运营的数字化载体。

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js + Express + MongoDB (TCB) |
| H5 会员端 | UniApp + Vue 3 + Pinia |
| 管理后台 | React 18 + Ant Design 5 + Zustand |
| 部署平台 | 腾讯云 TCB 云开发 |

## 项目结构

```
RocketBird/
├── packages/
│   ├── shared/          # 共享代码 (类型、常量、工具)
│   ├── server/          # 后端 - TCB 云函数
│   ├── member-h5/       # H5 会员端 - UniApp
│   └── admin/           # 管理后台 - React
├── openspec/            # OpenSpec 规范文档
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Yarn >= 1.22.0

### 安装依赖

```bash
yarn install
```

### 开发运行

```bash
# 启动后端
yarn dev:server

# 启动 H5 会员端
yarn dev:h5

# 启动管理后台
yarn dev:admin
```

### 构建

```bash
# 构建所有项目
yarn build:all

# 单独构建
yarn build:server
yarn build:h5
yarn build:admin
```

## 功能模块

### 一期功能 (MVP)

**H5 会员端**
- 会员登录注册 (微信授权 + 手机验证码)
- 会员等级与权益
- 积分体系与积分商城
- 打卡分享
- 会员福利 (生日礼/成长礼/新会员礼)
- 每日健身餐推荐
- 推荐好友
- 意见反馈

**管理后台**
- 会员管理
- 积分管理
- 内容管理 (打卡/健身餐/品牌)
- 运营管理 (福利/分享/邀请)
- 数据统计
- 系统管理 (账号/角色/日志)

### 二期功能

- 微信小程序
- 抽奖活动
- 会员日活动
- 赛事活动
- 精彩瞬间
- 秒杀活动
- 即时聊天

## 文档

- [产品文档](./产品文档.md)
- [OpenSpec 规范](./openspec/)
- [API 文档](./docs/api.md)

## License

MIT
