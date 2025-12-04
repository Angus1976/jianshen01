# 📋 RocketBird 部署脚本索引

> 快速导航所有部署和验证脚本

---

## 🚀 核心脚本

### 1. 配置指南脚本
**文件**: `scripts/setup-trigger.py`  
**用途**: 显示详细的 HTTP 触发器配置步骤  
**运行**:
```bash
python3 scripts/setup-trigger.py
```

**输出内容**:
- ✓ TCB 环境验证
- ✓ 云函数状态
- ✓ HTTP 触发器配置步骤（含截图指引）
- ✓ API 测试命令
- ✓ 故障排除指南

**何时使用**: 需要在 TCB 控制台配置 HTTP 触发器时

---

### 2. 部署验证脚本
**文件**: `scripts/verify-deployment.py`  
**用途**: 完整验证部署是否成功  
**运行**:
```bash
python3 scripts/verify-deployment.py
```

**验证项**:
1. ✓ TCB 环境存在
2. ✓ 云函数已部署
3. ✓ API 可访问（需要触发器）
4. ✓ 用户登录功能
5. ✓ 获取个人信息功能

**何时使用**: 配置 HTTP 触发器后，验证是否成功

---

### 3. 自动部署验证脚本（Python）
**文件**: `scripts/auto-deploy.py`  
**用途**: 自动验证所有部署组件  
**运行**:
```bash
python3 scripts/auto-deploy.py
```

**验证内容**:
- ✓ 环境验证
- ✓ 云函数验证
- ✓ 函数详细信息
- ✓ HTTP 触发器配置建议
- ✓ 数据库状态
- ✓ 测试账户信息

**何时使用**: 快速了解部署状态，获取配置建议

---

### 4. 自动部署验证脚本（Bash）
**文件**: `scripts/auto-deploy.sh`  
**用途**: Shell 版本的部署验证  
**运行**:
```bash
bash scripts/auto-deploy.sh
# 或
./scripts/auto-deploy.sh
```

**何时使用**: 偏好使用 Shell 脚本的用户

---

## 📚 重要文档

### 部署报告
**文件**: `DEPLOYMENT_REPORT.md`  
**内容**: 完整的部署状态报告，包含所有细节  
**包含**:
- 部署概览表
- 已完成部分详列
- HTTP 触发器配置步骤
- 测试方法
- 故障排除指南
- 检查清单

**何时查看**: 需要完整了解部署细节

---

### 快速完成指南
**文件**: `QUICK_COMPLETE.md`  
**内容**: 简洁的快速完成步骤  
**包含**:
- 当前状态（85% 完成）
- 最后一步（5分钟）
- 验证部署
- 测试账户
- 常见问题

**何时查看**: 快速完成部署配置

---

### 部署就绪
**文件**: `DEPLOYMENT_READY.md`  
**内容**: 部署完成后的指导  
**包含**:
- 快速开始步骤
- 手动测试 API
- 测试应用
- 部署清单
- 下一步建议

**何时查看**: 对部署流程有总体了解

---

## 🔧 TCB CLI 命令

### 查看环境列表
```bash
tcb env list
```

### 查看云函数
```bash
tcb fn list --envId cloud1-4g2aaqb40446a63b
```

### 查看托管文件
```bash
tcb hosting list --envId cloud1-4g2aaqb40446a63b
```

### 查看数据库集合
```bash
tcb db list --envId cloud1-4g2aaqb40446a63b
```

### 查看云函数日志（实时）
```bash
tcb fn log api --envId cloud1-4g2aaqb40446a63b --follow
```

### 查看云函数日志（历史）
```bash
tcb fn log api --envId cloud1-4g2aaqb40446a63b
```

---

## 📋 使用流程图

```
部署完成清单
│
├─ 第1步：了解状态
│  └─ 阅读: DEPLOYMENT_REPORT.md 或 QUICK_COMPLETE.md
│
├─ 第2步：配置触发器
│  └─ 运行: python3 scripts/setup-trigger.py
│  └─ 在 TCB 控制台手动配置 HTTP 触发器
│  └─ 等待 2-3 分钟生效
│
├─ 第3步：验证部署
│  └─ 运行: python3 scripts/verify-deployment.py
│  └─ 查看验证结果
│
└─ 第4步：测试应用
   ├─ 打开 H5: https://...tcloudbaseapp.com
   ├─ 打开管理后台: https://...tcloudbaseapp.com/admin
   └─ 测试登录和功能
```

---

## ✅ 脚本可执行性检查

所有脚本已设置为可执行：

```bash
# 检查脚本权限
ls -la scripts/*.py scripts/*.sh

# 如果需要重新设置权限
chmod +x scripts/*.py scripts/*.sh
```

---

## 🎯 快速命令

### 最快完成部署（一行命令）
```bash
# 显示配置步骤 + 验证 + 显示总结
python3 scripts/setup-trigger.py && \
sleep 180 && \  # 等待 3 分钟让触发器生效
python3 scripts/verify-deployment.py
```

### 快速查看部署状态
```bash
python3 scripts/auto-deploy.py
```

### 完整验证
```bash
python3 scripts/verify-deployment.py
```

---

## 📞 获取帮助

| 场景 | 操作 |
|------|------|
| 不知道该做什么 | 阅读 QUICK_COMPLETE.md |
| 需要配置步骤 | 运行 scripts/setup-trigger.py |
| 想验证部署 | 运行 scripts/verify-deployment.py |
| 遇到问题 | 查看 DEPLOYMENT_REPORT.md 的故障排除部分 |
| 需要完整信息 | 查看 DEPLOYMENT_REPORT.md |

---

**快速导航**: [快速完成](QUICK_COMPLETE.md) | [部署报告](DEPLOYMENT_REPORT.md) | [部署就绪](DEPLOYMENT_READY.md)

