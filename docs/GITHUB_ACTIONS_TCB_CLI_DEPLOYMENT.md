# GitHub Actions + TCB CLI 自动部署指南

## 概述

本指南展示如何使用 GitHub Actions + TCB CLI 实现完全自动化的从 GitHub 到 TCB 的部署流程。

```
GitHub Commit
    ↓
GitHub Actions Trigger
    ↓
构建 H5/Admin/Server → 构建 Docker 镜像 → 推送到 CCR
    ↓
TCB CLI 自动部署
    ↓
TCB 容器型服务启动
    ↓
✅ 部署完成
```

---

## 项目结构

```
RocketBird/
├── .github/workflows/
│   └── deploy-to-tcb-container.yml    # GitHub Actions 工作流（9 个 Job）
├── scripts/
│   ├── deploy-tcb-container.sh        # TCB CLI 部署脚本（Bash）
│   └── deploy-tcb-container.py        # TCB CLI 部署脚本（Python）
├── Dockerfile                          # 多阶段构建镜像
├── .env.local                          # TCB 凭证和环境变量
└── docs/
    └── GITHUB_TO_TCB_DEPLOYMENT.md     # 完整部署指南
```

---

## 第一步：配置 GitHub Secrets

### 1.1 需要配置的 Secrets

打开 GitHub 仓库设置：
https://github.com/Angus1976/jianshen01/settings/secrets/actions

添加以下 Secrets：

| Secret 名称 | 说明 | 获取方式 |
|------------|------|--------|
| `TENCENT_DOCKER_USERNAME` | 腾讯云账号 ID | 腾讯云控制台右上角账号菜单 |
| `TENCENT_DOCKER_PASSWORD` | 容器仓库访问令牌 | CCR 凭证管理 |
| `TENCENT_SECRET_ID` | TCB API 密钥 ID | API 密钥管理 |
| `TENCENT_SECRET_KEY` | TCB API 密钥 | API 密钥管理 |

### 1.2 获取腾讯云凭证

#### 获取 Docker 登录凭证

```bash
# 1. 登录腾讯云控制台
# https://console.cloud.tencent.com/tcr

# 2. 进入 CCR → 命名空间管理 → rocketbird

# 3. 生成访问令牌
# - 访问令牌名: github-actions
# 复制生成的用户名和密码
```

#### 获取 API 密钥

```bash
# 1. 腾讯云控制台
# https://console.cloud.tencent.com/cam/capi

# 2. 创建新的 API 密钥
# - 或使用现有密钥

# 3. 复制 SecretId 和 SecretKey
```

---

## 第二步：配置本地环境（可选）

### 2.1 更新 .env.local

```bash
# .env.local
TCB_ENV_ID=cloud1-4g2aaqb40446a63b
TCB_SECRET_ID=your-secret-id
TCB_SECRET_KEY=your-secret-key

# Docker 凭证（用于本地测试）
TENCENT_DOCKER_USERNAME=your-username
TENCENT_DOCKER_PASSWORD=your-password
```

### 2.2 安装 TCB CLI

```bash
# 全局安装 TCB CLI
npm install -g @cloudbase/cli

# 验证安装
tcb --version
```

---

## 第三步：GitHub Actions 工作流说明

### 3.1 工作流触发条件

文件：`.github/workflows/deploy-to-tcb-container.yml`

触发条件：
- ✅ 推送到 `main` 分支
- ✅ 推送到 `deploy` 分支  
- ✅ 手动触发 (`workflow_dispatch`)

### 3.2 9 个 Job 的执行流程

#### Job 1: 环境检查 (setup)
```yaml
- 生成版本标签（commit SHA）
- 输出版本信息
```

#### Job 2: 构建 H5 前端 (build-h5)
```yaml
- 检出代码
- 设置 Node.js 18
- 安装依赖
- 编译 H5 (yarn build)
- 缓存构建产物
```

#### Job 3: 构建管理后台 (build-admin)
```yaml
- 检出代码
- 设置 Node.js 18
- 安装依赖
- 编译管理后台 (yarn build)
- 缓存构建产物
```

#### Job 4: 构建后端服务 (build-server)
```yaml
- 检出代码
- 设置 Node.js 18
- 安装依赖
- 编译后端服务 (yarn build)
- 缓存构建产物
```

#### Job 5: 构建 Docker 镜像 (build-and-push-image)
```yaml
- 恢复所有构建产物
- 设置 Docker Buildx
- 登录腾讯云 CCR
- 构建多阶段 Docker 镜像
- 推送到 ccr.ccs.tencentyun.com/rocketbird/rocketbird-app
  - 标签: latest
  - 标签: commit-sha
```

#### Job 6: TCB 部署 (deploy-to-tcb)
```yaml
- 设置 Node.js
- 全局安装 TCB CLI
- 使用 TENCENT_SECRET_ID/KEY 登录
- 运行部署脚本 (scripts/deploy-tcb-container.py)
```

#### Job 7: 验证部署 (verify-deployment)
```yaml
- 生成部署报告
- 上传为 Artifact
```

#### Job 8: 成功通知 (notify-success)
```yaml
- 输出成功消息
- 显示镜像地址和控制台链接
```

#### Job 9: 失败通知 (notify-failure)
```yaml
- 输出失败消息
- 提供日志链接
```

---

## 第四步：运行部署

### 4.1 触发自动部署

```bash
# 1. 提交代码
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird

git add .
git commit -m "feat: 更新功能或修复 Bug"

# 2. 推送到 GitHub
git push origin main
```

### 4.2 监控部署过程

1. 打开 GitHub Actions
   - https://github.com/Angus1976/jianshen01/actions

2. 查看最新工作流运行
   - 点击 "部署 RocketBird 到 TCB（容器型服务）"

3. 查看每个 Job 的执行进度
   - 🟡 运行中: 黄色
   - 🟢 成功: 绿色
   - 🔴 失败: 红色

### 4.3 预期输出

#### H5 构建
```
✅ 编译 H5
   - dist/ 文件生成
   - 大小约 500KB
```

#### 管理后台构建
```
✅ 编译管理后台
   - dist/ 文件生成
   - 大小约 2MB
```

#### 后端服务构建
```
✅ 编译后端服务
   - dist/ 文件生成
   - node_modules 安装完成
```

#### Docker 镜像构建
```
✅ 镜像构建成功
   构建器: docker-container
   
   构建上下文大小: ~50MB
   
   Dockerfile 阶段:
   - Stage 0: H5 builder ✓
   - Stage 1: Admin builder ✓
   - Stage 2: Server builder ✓
   - Stage 3: Production ✓
   
   推送镜像到:
   - ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:abc1234
   - ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
   
   镜像大小: ~400MB
```

#### TCB 部署
```
✅ TCB CLI 部署脚本执行
   
   验证配置: ✓
   - 环境 ID: cloud1-4g2aaqb40446a63b
   - 镜像: ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
   - 服务: rocketbird-api
   
   TCB 认证: ✓
   
   服务配置已生成:
   - 服务名: rocketbird-api
   - 端口: 8000
   - CPU: 500m
   - 内存: 1Gi
   - 最小实例数: 1
   - 最大实例数: 5
```

---

## 第五步：在 TCB 控制台完成服务创建

### 5.1 创建容器型服务

> 注意：GitHub Actions 只负责推送镜像。需要在 TCB 控制台手动创建或更新服务。

1. 打开 TCB 云托管
   - https://console.cloud.tencent.com/tcb/env/cloud1-4g2aaqb40446a63b/service

2. 点击「新建云托管服务」或「编辑服务」

3. 填写服务配置：

| 配置项 | 值 |
|--------|-----|
| 服务名 | `rocketbird-api` |
| 部署方式 | 使用镜像 |
| 镜像地址 | `ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest` |
| 端口 | `8000` |
| CPU | `500m` |
| 内存 | `1Gi` |
| 初始实例数 | `1` |

4. 配置环境变量
   ```
   NODE_ENV=production
   TCB_ENV_ID=cloud1-4g2aaqb40446a63b
   PORT=8000
   ```

5. 配置健康检查
   ```
   路径: /api/health
   初始延迟: 5s
   超时: 10s
   检查间隔: 30s
   ```

6. 点击「部署」

### 5.2 配置自动更新

1. 服务详情 → 编辑配置

2. 启用「自动更新镜像」

3. 选择「总是拉取最新版本」

这样 GitHub Actions 推送新镜像时，TCB 会自动更新。

---

## 第六步：验证部署

### 6.1 查看服务状态

```bash
# 1. 打开 TCB 控制台
# https://console.cloud.tencent.com/tcb/env/cloud1-4g2aaqb40446a63b/service

# 2. 查看 rocketbird-api 服务
# - 状态: 运行中
# - 实例数: 1
# - 访问 URL: https://<xxxx>.app.tcloudbase.com
```

### 6.2 测试 API

```bash
# 获取服务 URL（从 TCB 控制台复制）
SERVICE_URL="https://<xxxx>.app.tcloudbase.com"

# 测试健康检查
curl $SERVICE_URL/api/health

# 应返回:
# {"status":"ok","timestamp":"2024-12-05T10:00:00Z"}

# 测试登录
curl -X POST $SERVICE_URL/api/auth/password-login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'

# 访问 H5
open $SERVICE_URL/h5

# 访问管理后台
open $SERVICE_URL/admin
```

### 6.3 查看容器日志

```bash
# TCB 控制台 → 服务详情 → 日志

# 查看应用启动日志
# 验证:
# ✓ Server 启动成功
# ✓ 数据库连接成功
# ✓ 路由注册成功
# ✓ 健康检查通过
```

---

## 本地测试部署脚本

### 7.1 使用 Bash 脚本测试

```bash
# 确保已设置 .env.local
source .env.local

# 运行部署脚本
bash scripts/deploy-tcb-container.sh
```

### 7.2 使用 Python 脚本测试

```bash
# 安装依赖
pip install python-dotenv

# 运行部署脚本
python3 scripts/deploy-tcb-container.py
```

---

## 故障排除

### 问题 1: GitHub Actions 构建失败

**症状**: 工作流在「构建 H5」或「构建后端」阶段失败

**排查步骤**:
1. 查看工作流日志
2. 检查依赖是否正确
   ```bash
   yarn install --frozen-lockfile
   ```
3. 本地验证代码能否编译
   ```bash
   cd packages/member-h5
   yarn build
   ```

### 问题 2: Docker 镜像推送失败

**症状**: 工作流在「构建 Docker 镜像」阶段失败

**排查步骤**:
1. 检查 Docker Registry Secrets 是否正确设置
   ```
   TENCENT_DOCKER_USERNAME: 腾讯云账号 ID
   TENCENT_DOCKER_PASSWORD: 访问令牌（不是登录密码！）
   ```
2. 验证访问令牌未过期
   - 腾讯云控制台 → CCR → 凭证管理

### 问题 3: TCB 部署脚本失败

**症状**: 工作流在「部署到 TCB」阶段失败

**排查步骤**:
1. 检查 TCB Secrets 是否正确
   ```
   TENCENT_SECRET_ID: API 密钥 ID
   TENCENT_SECRET_KEY: API 密钥
   ```
2. 验证 TCB 环境是否正常
   ```bash
   # 本地测试
   tcb login --secretId <id> --secretKey <key>
   tcb env:info --env-id cloud1-4g2aaqb40446a63b
   ```

### 问题 4: 容器无法启动

**症状**: TCB 服务创建后容器启动失败

**排查步骤**:
1. 查看容器日志
   - TCB 控制台 → 服务详情 → 日志
2. 检查环境变量是否正确
3. 验证镜像中的应用能否启动
   ```bash
   docker run --rm \
     -e NODE_ENV=production \
     -p 8000:8000 \
     ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
   ```

### 问题 5: 健康检查失败

**症状**: TCB 服务运行但健康检查持续失败

**排查步骤**:
1. 验证 `/api/health` 端点存在
   ```bash
   curl http://localhost:8000/api/health
   ```
2. 查看应用日志获取错误信息
3. 增加健康检查的初始延迟时间

---

## 持续集成流程

### 标准 CI/CD 流程

每次代码更新时：

```
1. git push origin main
   ↓
2. GitHub Actions 自动触发
   - 编译 H5 (2分钟)
   - 编译管理后台 (3分钟)
   - 编译后端服务 (3分钟)
   - 构建 Docker 镜像 (5分钟)
   - 推送镜像到 CCR (1分钟)
   - 执行 TCB 部署脚本 (1分钟)
   - 验证部署 (1分钟)
   ↓
3. 总耗时: ~15-20 分钟
   ↓
4. 镜像已在 CCR 可用
   ↓
5. 在 TCB 控制台选择新镜像或启用自动更新
   ↓
6. TCB 自动部署新镜像 (2-5分钟)
   ↓
7. ✅ 应用更新完成
```

---

## 监控和维护

### 8.1 设置工作流通知

GitHub 可以配置失败通知：

1. 仓库设置 → Actions → Notifications
2. 选择通知方式
3. 启用失败、成功等通知

### 8.2 查看部署历史

GitHub Actions 保存所有部署记录：
- https://github.com/Angus1976/jianshen01/actions

### 8.3 回滚到上一个版本

```bash
# 查看历史部署
# TCB 控制台 → 服务详情 → 版本历史

# 选择上一个版本并点击「回滚」

# 或手动指定镜像版本
# 镜像地址: ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:v1.0.0
```

---

## 常用命令速查表

### GitHub 相关

```bash
# 查看本地分支
git branch

# 推送到远程（触发 CI/CD）
git push origin main

# 查看 GitHub Actions 状态
# https://github.com/Angus1976/jianshen01/actions

# 查看工作流日志
# 点击具体工作流运行 → 查看详细日志
```

### TCB 相关

```bash
# 登录 TCB
tcb login --secretId <id> --secretKey <key>

# 查询环境信息
tcb env:info --env-id cloud1-4g2aaqb40446a63b

# 查询服务
tcb service:ls --env-id cloud1-4g2aaqb40446a63b

# 查看服务详情
tcb service:info --env-id cloud1-4g2aaqb40446a63b --name rocketbird-api

# 查看日志
tcb service:logs --env-id cloud1-4g2aaqb40446a63b --name rocketbird-api
```

### Docker 相关

```bash
# 本地构建镜像
docker build -t rocketbird-app:latest .

# 本地测试镜像
docker run --rm -p 8000:8000 rocketbird-app:latest

# 查看镜像历史
docker image history rocketbird-app:latest

# 推送到 CCR（需要登录）
docker login ccr.ccs.tencentyun.com
docker tag rocketbird-app:latest ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
docker push ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest
```

---

## 总结

✅ **自动化部署流程已完全建立**

1. GitHub Secrets 配置完成
2. GitHub Actions 工作流已创建
3. 9 个 Job 自动协作构建和部署
4. Docker 镜像自动推送到腾讯云 CCR
5. TCB CLI 脚本自动执行部署命令
6. 每次 git push 都会自动触发完整的 CI/CD 流程

**下一步**:
1. ✅ 配置 GitHub Secrets
2. ✅ 推送代码到 main 分支
3. ✅ 监控 GitHub Actions 工作流
4. ✅ 在 TCB 控制台创建或更新服务
5. ✅ 启用自动镜像更新
6. ✅ 验证服务正常运行

**完全自动化后，只需**:
```bash
git push origin main  # 一条命令触发所有流程！
```

🎉 **部署完全自动化！**
