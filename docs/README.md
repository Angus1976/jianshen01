# 📖 RocketBird 完整文档导航

## 🗂️ 文档结构

```
docs/
├── README.md                    ← 文档首页（当前文件）
├── PROJECT_OVERVIEW.md          ← 📱 项目完整概览
├── DEPLOYMENT_COMPLETE.md       ← 🚀 部署完成指南
├── TRIGGER_CONFIG.md            ← ⚙️ 触发器配置详细文档
├── QUICK_REFERENCE.md           ← ⚡ 快速参考卡片
├── SCRIPTS_GUIDE.md             ← 🤖 自动化脚本使用指南
├── CHECKLIST.md                 ← ✅ 项目完成清单
└── README.md                    ← 本文件
```

---

## 🎯 快速导航

### 🚀 我想立即开始使用

**前往**: [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)

包含:
- 🔑 快速登录链接
- 👤 测试账户凭证
- 📱 移动端调试
- 🐛 常见错误修复

---

### 📱 我想了解项目架构

**前往**: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)

包含:
- 🏗️ 系统架构图
- 📦 项目文件结构
- 🛠️ 技术栈清单
- 👥 功能模块说明
- 📊 数据库集合设计
- 🔐 安全配置说明

---

### 🚀 我想部署项目

**前往**: [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md)

包含:
- ✅ 部署完成验证
- 🔧 配置 HTTP 触发器 (**必需**)
- 🧪 测试 API 功能
- 📝 部署后清单
- 🐛 故障排除指南
- 💡 性能优化建议

---

### ⚙️ 我想配置定时任务

**前往**: [`TRIGGER_CONFIG.md`](./TRIGGER_CONFIG.md)

包含:
- 📋 HTTP 触发器配置
- ⏰ 定时触发器配置
- 📝 Cron 表达式说明
- 💻 代码中处理触发事件
- 📱 在 UI 中手动配置
- 🔍 触发器调试技巧

---

### 🤖 我想使用自动化脚本

**前往**: [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md)

包含:
- 📝 脚本列表和用途
- 🚀 快速开始步骤
- 💡 命令示例和说明
- 📊 配置对比表
- 🧪 API 测试命令
- ❓ 常见问题解答

---

### ✅ 我想检查项目完成度

**前往**: [`CHECKLIST.md`](./CHECKLIST.md)

包含:
- 📊 完成度统计表
- ✅ 已完成工作清单
- ⏳ 立即需要的操作
- 🧪 测试清单
- 🔍 验证清单
- 📚 命令汇总

---

## 📚 按场景快速查找

### 场景 1: 新员工入职

1. 先阅读 [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) 了解项目
2. 查看 [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) 获取访问链接
3. 按 [`CHECKLIST.md`](./CHECKLIST.md) 验证环境配置

**预计时间**: 30 分钟

---

### 场景 2: 完成部署

1. 按 [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md) 第一部分配置 HTTP 触发器
2. 使用 [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md) 中的命令测试 API
3. 对比 [`CHECKLIST.md`](./CHECKLIST.md) 确认所有步骤完成

**预计时间**: 15 分钟

---

### 场景 3: 配置定时任务

1. 查看 [`TRIGGER_CONFIG.md`](./TRIGGER_CONFIG.md) 了解定时任务
2. 使用 [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md) 中的脚本生成配置
3. 按 [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md) 手动配置

**预计时间**: 20 分钟

---

### 场景 4: 测试和调试

1. 查看 [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) 获取测试账户
2. 按 [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md) 测试各个模块
3. 如有问题，查看 [`TRIGGER_CONFIG.md`](./TRIGGER_CONFIG.md) 中的调试部分

**预计时间**: 45 分钟

---

### 场景 5: 解决问题

1. 在 [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md) 的故障排除部分查找症状
2. 如果找不到，查看 [`CHECKLIST.md`](./CHECKLIST.md) 的"已知问题"部分
3. 运行 [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md) 中的脚本获取更多信息

**预计时间**: 取决于问题复杂度

---

## 🔑 核心信息速记

### 环境 ID
```
cloud1-4g2aaqb40446a63b
```

### 访问链接

| 应用 | URL |
|------|-----|
| H5 会员端 | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com |
| 管理后台 | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/admin |
| TCB 控制台 | https://console.cloud.tencent.com/tcb |

### 测试账户

```
账户: 13800000001-13800000005
密码: 123456
```

### API 基础 URL

```
/api  (相对路径，自动识别域名)
```

---

## 🚀 常用命令速记

### 查看配置

```bash
# 显示手动配置步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 获取 API 测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 获取完整配置 JSON
python3 scripts/setup-cloudbase.py --config-json
```

### 查看日志

```bash
# 实时日志
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow

# 查看日志
tcb fn log api -e cloud1-4g2aaqb40446a63b

# 导出日志
tcb fn log api -e cloud1-4g2aaqb40446a63b > logs.txt
```

### 本地开发

```bash
# H5 开发
cd packages/member-h5 && npm run dev

# 管理后台开发
cd packages/admin && npm run dev

# 后端开发
cd packages/server && npm run dev

# 全部构建
npm run build
```

---

## 📊 文档对比表

| 文档 | 长度 | 难度 | 用途 |
|------|------|------|------|
| PROJECT_OVERVIEW | 📄 长 | ⭐⭐⭐ 中 | 理解架构 |
| DEPLOYMENT_COMPLETE | 📄 长 | ⭐⭐⭐ 中 | 完成部署 |
| TRIGGER_CONFIG | 📄 中 | ⭐⭐⭐⭐ 高 | 配置触发器 |
| QUICK_REFERENCE | 📄 短 | ⭐ 低 | 快速查询 |
| SCRIPTS_GUIDE | 📄 中 | ⭐⭐ 低 | 使用脚本 |
| CHECKLIST | 📄 长 | ⭐ 低 | 检查进度 |

---

## 🎓 学习路径

### 初级 (0-2 小时)

1. ⚡ [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) - 了解快速链接和基础
2. 📱 [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) - 了解项目架构
3. ✅ [`CHECKLIST.md`](./CHECKLIST.md) - 检查完成度

### 中级 (2-6 小时)

1. 🚀 [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md) - 学习部署过程
2. 🤖 [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md) - 掌握自动化工具
3. 📝 代码 - 阅读源代码

### 高级 (6+ 小时)

1. ⚙️ [`TRIGGER_CONFIG.md`](./TRIGGER_CONFIG.md) - 深入理解触发器
2. 📊 源代码 - 理解业务逻辑
3. 🏗️ 架构改进 - 优化系统设计

---

## 🔗 文档交叉引用

### PROJECT_OVERVIEW 引用

- 技术栈 → 参考 DEPLOYMENT_COMPLETE 的"环境信息"
- 项目结构 → 参考源代码实际结构
- 常见问题 → 参考 DEPLOYMENT_COMPLETE 的"故障排除"

### DEPLOYMENT_COMPLETE 引用

- 配置步骤 → 参考 TRIGGER_CONFIG
- 脚本使用 → 参考 SCRIPTS_GUIDE
- 完成度检查 → 参考 CHECKLIST

### TRIGGER_CONFIG 引用

- 手动配置 → 参考 DEPLOYMENT_COMPLETE
- 脚本生成 → 参考 SCRIPTS_GUIDE
- Cron 表达式 → 参考互联网资源

### SCRIPTS_GUIDE 引用

- 脚本原理 → 参考 TRIGGER_CONFIG
- 命令说明 → 参考脚本源代码
- 故障排除 → 参考 DEPLOYMENT_COMPLETE

### QUICK_REFERENCE 引用

- 详细信息 → 参考相关专项文档
- 常见问题 → 参考 DEPLOYMENT_COMPLETE
- 命令示例 → 参考 SCRIPTS_GUIDE

### CHECKLIST 引用

- 部署步骤 → 参考 DEPLOYMENT_COMPLETE
- 测试用例 → 参考 QUICK_REFERENCE
- 命令汇总 → 参考 SCRIPTS_GUIDE

---

## 💡 使用建议

### 阅读建议

1. **首次阅读**: 按学习路径顺序阅读
2. **快速查询**: 使用快速导航直接跳转
3. **深入学习**: 结合源代码和官方文档学习
4. **定期复习**: 每个月复习一次核心概念

### 分享建议

1. **新员工**: 分享完整路径 (初级阶段)
2. **技术分享**: 分享 PROJECT_OVERVIEW 理解架构
3. **部署培训**: 分享 DEPLOYMENT_COMPLETE 学习部署
4. **脚本培训**: 分享 SCRIPTS_GUIDE 学习自动化

### 维护建议

1. **定期更新**: 每次部署后更新 CHECKLIST
2. **记录问题**: 在 DEPLOYMENT_COMPLETE 中记录新问题
3. **改进脚本**: 根据使用反馈改进脚本
4. **更新链接**: 定期检查所有链接是否有效

---

## 🆘 获取帮助

### 问题类型分类

| 问题类型 | 查看文档 | 命令 |
|---------|---------|------|
| 登录失败 | DEPLOYMENT_COMPLETE | `python3 scripts/setup-cloudbase.py --curl-examples` |
| 部署问题 | DEPLOYMENT_COMPLETE | `bash scripts/deploy-tcb.sh` |
| 触发器问题 | TRIGGER_CONFIG | `python3 scripts/setup-cloudbase.py --manual-steps` |
| 脚本问题 | SCRIPTS_GUIDE | `python3 scripts/setup-cloudbase.py --help` |
| 系统问题 | PROJECT_OVERVIEW | `tcb fn log api -e cloud1-4g2aaqb40446a63b --follow` |

### 快速诊断

```bash
# 1. 检查 HTTP 触发器是否配置
curl https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/health

# 2. 查看云函数日志
tcb fn log api -e cloud1-4g2aaqb40446a63b

# 3. 查看脚本帮助
python3 scripts/setup-cloudbase.py --help
```

---

## 📝 文档版本

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2025-12-04 | 初始版本，包含全部 6 份文档 |

---

## 🎯 下一步

1. **立即查看**: [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)
2. **深入理解**: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)
3. **完成部署**: [`DEPLOYMENT_COMPLETE.md`](./DEPLOYMENT_COMPLETE.md)
4. **使用脚本**: [`SCRIPTS_GUIDE.md`](./SCRIPTS_GUIDE.md)

---

**最后更新**: 2025-12-04

**项目状态**: 🟢 **部署完成，文档完整**

**维护者**: RocketBird 开发团队
