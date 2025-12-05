# 快速开始：从 GitHub 自动部署到 TCB

> 🚀 **5分钟完成部署配置，之后一条命令自动部署！**

## 📋 前置准备

确保你已经有：
- ✅ GitHub 仓库 (https://github.com/Angus1976/jianshen01)
- ✅ 腾讯云账号
- ✅ TCB 环境 (cloud1-4g2aaqb40446a63b)

## ⚡ 快速配置（5分钟）

### 第 1 步：检查本地环境（1分钟）

```bash
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird

# 运行配置检查脚本
python3 scripts/check-deployment-config.py
```

输出示例：
```
✅ GitHub Actions 工作流: 已存在
✅ Dockerfile: 已存在
✅ 部署脚本: 已存在
✅ Git: 已安装
✅ Node.js: 已安装
✅ Docker: 已安装
✅ TCB CLI: 已安装
```

### 第 2 步：配置 GitHub Secrets（3分钟）

1. 打开 GitHub 仓库设置
   ```
   https://github.com/Angus1976/jianshen01/settings/secrets/actions
   ```

2. 点击 `New repository secret`，添加 4 个 Secrets：

   **Secret 1: Docker Username**
   - Name: `TENCENT_DOCKER_USERNAME`
   - Value: 你的腾讯云账号 ID

   **Secret 2: Docker Password**
   - Name: `TENCENT_DOCKER_PASSWORD`
   - Value: CCR 访问令牌（从腾讯云生成）

   **Secret 3: TCB Secret ID**
   - Name: `TENCENT_SECRET_ID`
   - Value: TCB API 密钥 ID

   **Secret 4: TCB Secret Key**
   - Name: `TENCENT_SECRET_KEY`
   - Value: TCB API 密钥

3. ✅ 保存所有 Secrets

### 第 3 步：提交代码（1分钟）

```bash
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird

# 添加所有文件
git add .

# 提交
git commit -m "feat: 完整的 GitHub Actions + TCB CLI 自动部署系统"

# 推送到 GitHub（这会触发自动部署！）
git push origin main
```

## 🚀 开始自动部署

### 查看部署进度

打开 GitHub Actions：
```
https://github.com/Angus1976/jianshen01/actions
```

点击最新工作流 `部署 RocketBird 到 TCB（容器型服务）`

### 工作流进度（预计 15-20 分钟）

```
1️⃣  环境检查             ⏱️ 1 分钟
    ↓
2️⃣  构建 H5 前端         ⏱️ 2 分钟
    ↓
3️⃣  构建管理后台         ⏱️ 3 分钟
    ↓
4️⃣  构建后端服务         ⏱️ 3 分钟
    ↓
5️⃣  构建 Docker 镜像     ⏱️ 5 分钟
    ↓
6️⃣  推送镜像到腾讯云    ⏱️ 1 分钟
    ↓
7️⃣  TCB CLI 部署脚本    ⏱️ 1 分钟
    ↓
8️⃣  生成部署报告        ⏱️ 1 分钟
    ↓
9️⃣  部署完成通知        ⏱️ < 1 分钟

总耗时: ~15-20 分钟 ✅
```

### 监控工作流

- 🟡 黄色 = 运行中
- 🟢 绿色 = 成功
- 🔴 红色 = 失败

## ✅ 验证部署

### 1️⃣ 检查镜像是否推送成功

工作流完成后，镜像应该在腾讯云 CCR：
```
ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
```

### 2️⃣ 在 TCB 控制台创建容器型服务

1. 打开 TCB 控制台
   ```
   https://console.cloud.tencent.com/tcb/env/cloud1-4g2aaqb40446a63b/service
   ```

2. 点击「新建云托管服务」

3. 填写配置：
   ```
   服务名: rocketbird-api
   镜像: ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
   端口: 8000
   CPU: 500m
   内存: 1Gi
   ```

4. 环境变量：
   ```
   NODE_ENV=production
   TCB_ENV_ID=cloud1-4g2aaqb40446a63b
   PORT=8000
   ```

5. 健康检查：
   ```
   路径: /api/health
   初始延迟: 5s
   超时: 10s
   间隔: 30s
   ```

6. 点击「部署」

### 3️⃣ 测试服务

服务启动后（约 2-5 分钟），在 TCB 控制台获取服务 URL，然后：

```bash
# 获取服务 URL
SERVICE_URL="https://<从TCB控制台复制>"

# 测试 API
curl $SERVICE_URL/api/health

# 访问 H5
open $SERVICE_URL/h5

# 访问管理后台
open $SERVICE_URL/admin
```

## 📚 后续更新

### 标准更新流程

之后每次更新只需：

```bash
# 1. 提交代码
git add .
git commit -m "修复或新功能说明"

# 2. 推送
git push origin main

# 3. 自动部署！
# GitHub Actions 会自动:
# ✓ 构建所有模块
# ✓ 生成 Docker 镜像
# ✓ 推送到 CCR
# ✓ 执行 TCB 部署脚本
```

### 启用 TCB 自动更新（可选）

如果启用，镜像推送后 TCB 会自动更新服务：

1. TCB 控制台 → 服务详情 → 编辑配置
2. 启用「自动更新镜像」
3. 选择「总是拉取最新版本」

这样完全无需手动操作！

## 🔧 常用命令

```bash
# 查看部署进度
# 打开: https://github.com/Angus1976/jianshen01/actions

# 本地测试部署脚本
python3 scripts/deploy-tcb-container.py

# 本地构建 Docker 镜像
docker build -t rocketbird-app:latest .

# 查看配置检查
python3 scripts/check-deployment-config.py
```

## ❓ 故障排除

### 问题: GitHub Actions 构建失败

**解决**:
1. 点击失败的工作流查看日志
2. 检查错误消息
3. 本地运行 `yarn build` 验证代码

### 问题: 镜像推送失败

**解决**:
1. 检查 Secrets 是否正确配置
2. 验证腾讯云凭证未过期
3. 确认 CCR 命名空间存在

### 问题: TCB 服务无法启动

**解决**:
1. 查看 TCB 控制台的容器日志
2. 验证环境变量正确
3. 检查健康检查端点

## 📖 详细文档

- 📄 [完整部署指南](./GITHUB_ACTIONS_TCB_CLI_DEPLOYMENT.md)
- 📄 [GitHub 到 TCB 部署流程](./GITHUB_TO_TCB_DEPLOYMENT.md)
- 📄 [容器型部署指南](./CONTAINER_DEPLOYMENT.md)

## ✨ 工作流文件

- `.github/workflows/deploy-to-tcb-container.yml` - GitHub Actions 主工作流
- `scripts/deploy-tcb-container.sh` - TCB 部署脚本（Bash）
- `scripts/deploy-tcb-container.py` - TCB 部署脚本（Python）
- `scripts/check-deployment-config.py` - 配置检查脚本
- `Dockerfile` - 多阶段 Docker 构建文件

## 🎯 完成检查列表

- [ ] ✅ GitHub Secrets 已配置（4个）
- [ ] ✅ 代码已提交并推送
- [ ] ✅ GitHub Actions 工作流成功完成
- [ ] ✅ Docker 镜像已推送到 CCR
- [ ] ✅ TCB 容器型服务已创建
- [ ] ✅ 环境变量已配置
- [ ] ✅ 健康检查已通过
- [ ] ✅ API 可以访问
- [ ] ✅ H5 应用可访问
- [ ] ✅ 管理后台可访问

完成以上所有项，部署就 100% 完成了！ 🎉

## 📞 需要帮助？

查看详细文档或联系技术支持。

---

**现在就开始部署吧！** 🚀

```bash
git push origin main
```

一行命令，完全自动化部署！✨
