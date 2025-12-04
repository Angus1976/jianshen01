# 🚀 RocketBird 快速开始指南

## ⚡ 30 秒快速开始

```bash
# 1. 查看配置步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 2. 按照步骤在 TCB 控制台配置 HTTP 触发器

# 3. 测试登录
curl -X POST 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/password-login' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'

# 4. 打开浏览器访问
# https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
```

---

## 📱 访问链接

| 应用 | URL | 账户 | 密码 |
|------|-----|------|------|
| H5 会员端 | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com | 13800000001 | 123456 |
| 管理后台 | https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/admin | 13800000001 | 123456 |
| TCB 控制台 | https://console.cloud.tencent.com/tcb | - | - |

---

## 🔑 项目关键信息

```
环境 ID:     cloud1-4g2aaqb40446a63b
后端函数:    api
数据库:      TCB 文档数据库
API 路径:    /api
```

---

## 📚 文档导航

| 需求 | 查看文档 |
|------|---------|
| 🎯 整体了解 | [`FINAL_SUMMARY.md`](./FINAL_SUMMARY.md) |
| 📖 快速参考 | [`docs/QUICK_REFERENCE.md`](./docs/QUICK_REFERENCE.md) |
| 🏗️ 项目架构 | [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md) |
| 🚀 部署说明 | [`docs/DEPLOYMENT_COMPLETE.md`](./docs/DEPLOYMENT_COMPLETE.md) |
| ⚙️ 触发器配置 | [`docs/TRIGGER_CONFIG.md`](./docs/TRIGGER_CONFIG.md) |
| 🤖 脚本使用 | [`docs/SCRIPTS_GUIDE.md`](./docs/SCRIPTS_GUIDE.md) |
| ✅ 完成清单 | [`docs/CHECKLIST.md`](./docs/CHECKLIST.md) |
| 📚 文档索引 | [`docs/README.md`](./docs/README.md) |

---

## ⚠️ 立即需要做的 (只需 5 分钟)

### 配置 HTTP 触发器

**为什么**: 让 API 能够接收 HTTP 请求

**步骤**:

1. 打开 TCB 控制台
   ```
   https://console.cloud.tencent.com/tcb
   ```

2. 选择环境 `cloud1-4g2aaqb40446a63b`

3. 进入 **云函数** → **api**

4. 点击 **新建触发器** → **HTTP**

5. 配置:
   ```
   路径:  /api
   方法:  GET, POST, PUT, DELETE, OPTIONS
   ```

6. 点击 **保存**

**完成后**: HTTP 触发器已配置，API 可以接收请求！

---

## 🧪 常用命令

### 查看配置

```bash
# 显示手动配置步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 获取 API 测试命令
python3 scripts/setup-cloudbase.py --curl-examples

# 获取完整配置 JSON
python3 scripts/setup-cloudbase.py --config-json

# 显示脚本帮助
python3 scripts/setup-cloudbase.py --help
```

### 查看日志

```bash
# 查看实时日志
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow

# 查看历史日志
tcb fn log api -e cloud1-4g2aaqb40446a63b

# 导出日志
tcb fn log api -e cloud1-4g2aaqb40446a63b > logs.txt
```

### 本地开发

```bash
# H5 会员端
cd packages/member-h5 && npm run dev

# 管理后台
cd packages/admin && npm run dev

# 后端 API
cd packages/server && npm run dev

# 全部构建
npm run build
```

---

## 🎯 三步完成部署

### 第 1 步: 查看配置 (1 分钟)

```bash
python3 scripts/setup-cloudbase.py --manual-steps
```

### 第 2 步: 配置触发器 (3 分钟)

在 TCB 控制台按照输出的步骤操作

### 第 3 步: 测试应用 (1 分钟)

```bash
# 方法 1: 浏览器测试
https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com

# 方法 2: curl 测试
python3 scripts/setup-cloudbase.py --curl-examples
```

---

## 💡 常见问题速解

### Q: 访问 API 显示 404?

**A:** 配置 HTTP 触发器 (见上文 "立即需要做的")

### Q: 登录显示 CORS 错误?

**A:** 查看 `docs/DEPLOYMENT_COMPLETE.md` 中的故障排除

### Q: 如何查看日志?

**A:** 运行 `tcb fn log api -e cloud1-4g2aaqb40446a63b --follow`

### Q: 如何使用测试账户?

**A:** 账户: `13800000001-13800000005`，密码: `123456`

---

## 📊 项目结构

```
RocketBird/
├── packages/
│   ├── member-h5/        # H5 会员端 (Vue3 + uni-app)
│   ├── admin/            # 管理后台 (React + Vite)
│   ├── server/           # 后端 API (Express.js)
│   └── shared/           # 共享类型和工具
├── docs/                 # 完整文档 (7 份)
├── scripts/              # 自动化脚本 (3 个)
├── FINAL_SUMMARY.md      # 项目总结 ← 推荐先看
├── README.md             # 项目说明
└── package.json          # 根级依赖
```

---

## 🎓 快速学习路径

### 🟢 初级 (10 分钟)

```
1. 读这个文件
2. 查看 docs/QUICK_REFERENCE.md
3. 配置 HTTP 触发器
```

### 🟡 中级 (1 小时)

```
1. 阅读 docs/PROJECT_OVERVIEW.md
2. 阅读 docs/DEPLOYMENT_COMPLETE.md
3. 运行脚本查看配置
```

### 🔴 高级 (2+ 小时)

```
1. 深入学习 docs/TRIGGER_CONFIG.md
2. 学习 docs/SCRIPTS_GUIDE.md
3. 阅读源代码
```

---

## 🚨 部署检查清单

```
✅ H5 部署完成    (66 个文件)
✅ Admin 部署完成  (4 个文件)
✅ API 部署完成    (云函数已配置)
✅ 数据库就绪      (TCB 文档数据库)
⏳ HTTP 触发器    (需要配置)
✅ 文档完成        (7 份文档)
✅ 脚本完成        (3 个脚本)
✅ 测试账户就绪    (5 个账户)
```

---

## 📞 获取帮助

### 自助支持 (推荐)

```bash
# 1. 查看帮助
python3 scripts/setup-cloudbase.py --help

# 2. 查看步骤
python3 scripts/setup-cloudbase.py --manual-steps

# 3. 查看日志
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow
```

### 查看文档

- 文档导航: `docs/README.md`
- 快速参考: `docs/QUICK_REFERENCE.md`
- 完整指南: `docs/DEPLOYMENT_COMPLETE.md`

---

## 🎉 接下来

### 立即 (5 分钟)

- [ ] 配置 HTTP 触发器
- [ ] 测试登录功能

### 今天 (30 分钟)

- [ ] 验证所有功能
- [ ] 查看项目文档

### 本周 (可选)

- [ ] 配置定时任务
- [ ] 启用监控告警
- [ ] 性能优化

---

**准备好了吗？** 👇

### 📖 推荐阅读顺序

1. ⭐ 本文件 (你现在看的) - 了解全局
2. 🚀 [`FINAL_SUMMARY.md`](./FINAL_SUMMARY.md) - 详细总结
3. 📖 [`docs/README.md`](./docs/README.md) - 文档导航

### 🔧 现在就做

```bash
python3 scripts/setup-cloudbase.py --manual-steps
```

### 🌐 立即访问

```
https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
```

---

**项目状态**: 🟢 **生产就绪** (仅需配置 HTTP 触发器)

**最后更新**: 2025-12-04

**准备开始**: ✅ 是
