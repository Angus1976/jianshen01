# 🗂️ 文件系统导航指南

> 快速找到你需要的文件

---

## 📂 根目录结构

```
RocketBird/
├── 📄 README.md                 ← 项目首页
├── 📄 QUICK_START.md            ← 30秒快速开始 ⭐⭐⭐
├── 📄 FINAL_SUMMARY.md          ← 项目完整总结 ⭐⭐⭐
├── 📄 DELIVERY_CHECKLIST.md     ← 交付清单 ⭐⭐
├── 📄 COMMANDS_CHEATSHEET.md    ← 命令速记
├── 📄 FILE_NAVIGATION.md        ← 本文件
├── 📁 docs/                     ← 📚 完整文档
├── 📁 scripts/                  ← 🤖 自动化脚本
├── 📁 packages/                 ← 💻 代码
├── 📁 openspec/                 ← 📋 规格文档
└── 📁 node_modules/             ← 依赖包
```

---

## 🎯 按用途快速查找

### 我是新人，想快速了解项目

```
1️⃣ 阅读
   ├─ README.md                   (2 分钟)
   └─ QUICK_START.md              (5 分钟)

2️⃣ 运行
   └─ python3 scripts/setup-cloudbase.py --manual-steps

3️⃣ 访问
   └─ https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
```

### 我想理解项目架构

```
阅读顺序:
1. FINAL_SUMMARY.md                    (15 分钟)
2. docs/PROJECT_OVERVIEW.md            (20 分钟)
3. packages/server/README.md           (5 分钟)
4. packages/member-h5/README.md        (5 分钟)
```

### 我想部署或运维

```
所需文件:
├─ QUICK_START.md                      (快速上手)
├─ docs/DEPLOYMENT_COMPLETE.md         (部署指南)
├─ docs/TRIGGER_CONFIG.md              (触发器配置)
├─ scripts/setup-cloudbase.py          (配置脚本)
└─ scripts/deploy-tcb.sh               (部署脚本)
```

### 我想开发新功能

```
所需文件:
├─ packages/server/                    (后端代码)
├─ packages/member-h5/                 (H5 代码)
├─ packages/admin/                     (Admin 代码)
├─ packages/shared/                    (共享代码)
└─ COMMANDS_CHEATSHEET.md              (命令速记)
```

### 我想调试问题

```
所需文件:
├─ COMMANDS_CHEATSHEET.md              (查询命令)
├─ docs/QUICK_REFERENCE.md             (故障排除)
├─ docs/DEPLOYMENT_COMPLETE.md         (部分故障排除)
└─ packages/server/src/app.ts          (查看日志配置)
```

---

## 📖 文档完整列表

### 根目录文档

| 文件 | 用途 | 大小 | 推荐度 |
|------|------|------|--------|
| README.md | 项目首页 | 2KB | ⭐⭐⭐ |
| QUICK_START.md | 30秒快速开始 | 4KB | ⭐⭐⭐ |
| FINAL_SUMMARY.md | 完整项目总结 | 15KB | ⭐⭐⭐ |
| DELIVERY_CHECKLIST.md | 交付清单 | 12KB | ⭐⭐ |
| COMMANDS_CHEATSHEET.md | 命令速记 | 8KB | ⭐⭐ |
| FILE_NAVIGATION.md | 本文件 | 7KB | ⭐⭐ |

### docs/ 文档

| 文件 | 用途 | 大小 | 推荐度 |
|------|------|------|--------|
| docs/README.md | 文档导航 | 6KB | ⭐⭐⭐ |
| docs/PROJECT_OVERVIEW.md | 项目架构详解 | 18KB | ⭐⭐⭐ |
| docs/DEPLOYMENT_COMPLETE.md | 部署完整指南 | 20KB | ⭐⭐⭐ |
| docs/TRIGGER_CONFIG.md | 触发器配置详解 | 15KB | ⭐⭐ |
| docs/QUICK_REFERENCE.md | 快速参考卡片 | 10KB | ⭐⭐⭐ |
| docs/SCRIPTS_GUIDE.md | 脚本使用指南 | 12KB | ⭐⭐ |
| docs/CHECKLIST.md | 完成清单 | 14KB | ⭐⭐ |

---

## 💻 代码文件快速定位

### 后端代码 (packages/server/)

```
packages/server/
├── src/
│   ├── app.ts              ← 主应用入口 (CORS, 路由设置)
│   ├── config/
│   │   └── database.ts     ← 数据库配置
│   ├── models/             ← 数据模型
│   ├── routes/             ← API 路由定义
│   ├── services/           ← 业务逻辑
│   └── utils/              ← 工具函数
├── dist/                   ← 编译输出 (部署用)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── cloudbaserc.json        ← TCB 部署配置
```

**关键文件**:
- `app.ts` - Express 应用主文件
- `config/database.ts` - TCB 数据库连接
- `cloudbaserc.json` - 云函数部署配置

### H5 代码 (packages/member-h5/)

```
packages/member-h5/
├── src/
│   ├── App.vue             ← 根组件
│   ├── main.ts             ← 入口文件
│   ├── pages/              ← 页面组件
│   ├── components/         ← 复用组件
│   ├── api/                ← API 调用
│   ├── stores/             ← 状态管理
│   └── utils/              ← 工具函数
├── dist/                   ← 编译输出 (部署用)
├── .env                    ← 环境变量 ⭐
├── package.json
├── vite.config.ts
└── cloudbaserc.json        ← TCB 部署配置
```

**关键文件**:
- `.env` - API 地址配置
- `api/` - API 调用层
- `pages/` - 各个功能页面

### 管理后台代码 (packages/admin/)

```
packages/admin/
├── src/
│   ├── App.tsx             ← 根组件
│   ├── main.tsx            ← 入口文件
│   ├── pages/              ← 页面组件
│   ├── components/         ← 复用组件
│   ├── services/           ← API 调用
│   ├── stores/             ← 状态管理 (Pinia)
│   └── utils/              ← 工具函数
├── dist/                   ← 编译输出 (部署用)
├── package.json
├── vite.config.ts
└── cloudbaserc.json        ← TCB 部署配置
```

### 共享代码 (packages/shared/)

```
packages/shared/
├── types/                  ← TypeScript 类型定义
│   ├── api.ts
│   ├── user.ts
│   ├── benefits.ts
│   └── ...
├── constants/              ← 常量定义
│   ├── status.ts
│   └── config.ts
├── utils/                  ← 工具函数
│   ├── format.ts           ← 格式化工具
│   ├── validate.ts         ← 验证工具
│   └── helpers.ts          ← 帮助函数
├── index.ts                ← 主导出文件 ⭐
├── tsconfig.json           ← TS 配置 (ES2022)
└── package.json
```

**关键文件**:
- `index.ts` - 导出所有类型和工具
- `tsconfig.json` - 已配置为 ES2022 模块

---

## 🤖 脚本文件

```
scripts/
├── deploy-tcb.sh           ← 部署脚本 (部署 H5, Admin, 后端)
├── setup-cloudbase.sh      ← Bash 配置脚本
└── setup-cloudbase.py      ← Python 配置脚本 (功能最全) ⭐
```

**常用命令**:

```bash
# 查看配置
python3 scripts/setup-cloudbase.py --manual-steps

# 部署
bash scripts/deploy-tcb.sh all

# 获取测试命令
python3 scripts/setup-cloudbase.py --curl-examples
```

---

## 🔧 配置文件

### 根目录配置

```
RocketBird/
├── .env                    ← 全局环境变量 (MongoDB → TCB)
├── package.json            ← 根级依赖
├── tsconfig.base.json      ← 根级 TypeScript 配置
└── cloudbaserc.json        ← TCB 全局配置 (可选)
```

### 模块级配置

```
packages/*/
├── .env                    ← 模块环境变量
├── package.json
├── tsconfig.json
├── vite.config.ts
├── cloudbaserc.json        ← TCB 部署配置
└── Dockerfile              ← Docker 镜像 (可选)
```

---

## 📋 规格文档

```
openspec/
├── AGENTS.md               ← Agent 规格
├── project.md              ← 项目规格
└── specs/                  ← 各模块规格
    ├── admin-system/
    ├── member-auth/
    ├── member-level/
    ├── member-benefits/
    ├── points-system/
    ├── checkin-share/
    ├── feedback-system/
    ├── referral/
    ├── brand-content/
    └── fitness-meals/
```

---

## 🔍 查找文件的方法

### 方法 1: 按名称搜索

```bash
# 查找所有 *.env 文件
find . -name ".env"

# 查找所有 React 组件
find . -name "*.tsx" | head -20

# 查找所有 Vue 组件
find . -name "*.vue" | head -20
```

### 方法 2: 按内容搜索

```bash
# 查找包含特定字符串的文件
grep -r "CLOUDBASE_ENV_ID" .

# 查找所有 API 路由定义
grep -r "app.post\|app.get" packages/server/src
```

### 方法 3: 按类型搜索

```bash
# 查找所有文档
find . -name "*.md" | sort

# 查找所有脚本
find . -name "*.sh" -o -name "*.py"

# 查找所有配置文件
find . -name "*.json" -path "*/cloudbaserc.json"
```

---

## 🎓 学习路径建议

### 🟢 初级开发者 (1-2 小时)

```
开始 ─→ README.md
        ↓
    QUICK_START.md
        ↓
    阅读你要开发的模块
        ↓
    packages/{module}/README.md
        ↓
    查看该模块的 pages/ 或 routes/
        ↓
    按 COMMANDS_CHEATSHEET.md 开发
```

### 🟡 中级开发者 (2-4 小时)

```
开始 ─→ FINAL_SUMMARY.md
        ↓
    docs/PROJECT_OVERVIEW.md
        ↓
    docs/DEPLOYMENT_COMPLETE.md
        ↓
    阅读相关模块源代码
        ↓
    理解业务流程和数据模型
        ↓
    修改代码并测试
```

### 🔴 高级开发者 (4+ 小时)

```
开始 ─→ docs/README.md (总览)
        ↓
    docs/TRIGGER_CONFIG.md (深入理解)
        ↓
    源代码分析
        ├─ packages/server/src/app.ts
        ├─ packages/shared/index.ts
        └─ packages/*/src/
        ↓
    架构改进和优化
```

---

## 🚀 按任务查找文件

### 任务: 新增 API 端点

所需文件:
- `packages/server/src/routes/` - 定义新路由
- `packages/server/src/services/` - 实现业务逻辑
- `packages/shared/types/api.ts` - 定义 API 类型

### 任务: 修改数据库字段

所需文件:
- `packages/shared/types/` - 更新类型定义
- `packages/server/src/config/database.ts` - 检查集合配置
- 相关的 services 和 routes

### 任务: 新增 H5 页面

所需文件:
- `packages/member-h5/src/pages/` - 新建页面
- `packages/member-h5/src/api/` - 调用 API
- `packages/member-h5/src/components/` - 复用组件
- `packages/shared/types/` - 类型定义

### 任务: 部署到生产

所需文件:
- `scripts/deploy-tcb.sh` - 运行部署脚本
- `docs/DEPLOYMENT_COMPLETE.md` - 参考部署指南
- `.env` - 确认环境变量
- 各模块 `cloudbaserc.json` - 确认部署配置

---

## 💾 重要文件备份提示

### 必须备份

```
.env                          ← 环境变量 (包含密钥)
packages/server/.env          ← 后端环境变量
packages/member-h5/.env       ← H5 环境变量
packages/*/cloudbaserc.json   ← 部署配置
```

### 建议备份

```
docs/                         ← 文档
scripts/                      ← 脚本
openspec/                     ← 规格文档
```

### 不用备份

```
node_modules/                 ← 可重新安装
dist/                         ← 可重新构建
*.log                         ← 日志文件
```

---

## 🎯 快速导航表

| 需求 | 查看文件 |
|------|---------|
| 快速开始 | `QUICK_START.md` |
| 了解架构 | `docs/PROJECT_OVERVIEW.md` |
| 部署应用 | `docs/DEPLOYMENT_COMPLETE.md` |
| 使用脚本 | `docs/SCRIPTS_GUIDE.md` |
| 常用命令 | `COMMANDS_CHEATSHEET.md` |
| 修改 API | `packages/server/src/` |
| 修改 H5 | `packages/member-h5/src/` |
| 修改 Admin | `packages/admin/src/` |
| 查看类型 | `packages/shared/types/` |
| 设置数据库 | `packages/server/src/config/database.ts` |
| 设置环境 | `.env` + `packages/*/. env` |
| 查看日志 | `tcb fn log api -e cloud1-4g2aaqb40446a63b --follow` |

---

## 🔗 相关文档链接

- [项目首页](./README.md)
- [快速开始](./QUICK_START.md)
- [项目总结](./FINAL_SUMMARY.md)
- [交付清单](./DELIVERY_CHECKLIST.md)
- [命令速记](./COMMANDS_CHEATSHEET.md)
- [文档导航](./docs/README.md)

---

**提示**: 将此文件收藏起来，便于快速查找文件 📂
