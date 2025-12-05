# TCB 从 GitHub 拉取部署指南

## 概述

本指南展示如何通过以下流程完成自动化部署：

```
GitHub push → GitHub Actions 自动构建 → 推送镜像到腾讯云 CCR → TCB 更新并部署
```

---

## 部署流程图

```
┌─────────────────────┐
│  Push 代码到 GitHub  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  GitHub Actions 工作流启动       │
│  (.github/workflows/deploy*.yml) │
└──────────┬──────────────────────┘
           │
           ├─ 检出代码
           ├─ 安装依赖
           ├─ 编译 H5 前端
           ├─ 编译管理后台
           ├─ 编译后端服务
           ├─ 构建 Docker 镜像
           └─ 推送到腾讯云 CCR
           │
           ▼
┌─────────────────────────────────┐
│  TCB 云托管服务                  │
│  1. 更新镜像地址                 │
│  2. 部署新版本                   │
│  3. 自动更新应用                 │
└─────────────────────────────────┘
```

---

## 第一步：配置 GitHub Secrets

GitHub Actions 需要腾讯云凭证来推送镜像。

### 1.1 获取腾讯云 CCR 凭证

1. 打开腾讯云控制台
   - https://console.cloud.tencent.com/tcr

2. 创建或使用现有的容器仓库命名空间
   - 命名空间名: `rocketbird`

3. 生成 Docker 登录凭证
   - 账户 ID (username): 你的腾讯云账号 ID
   - 访问令牌 (password): 在凭证管理中生成

### 1.2 添加 GitHub Secrets

1. 打开 GitHub 仓库设置
   - https://github.com/Angus1976/jianshen01/settings/secrets/actions

2. 点击「New repository secret」

3. 添加以下 Secrets:

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `TENCENT_DOCKER_USERNAME` | 你的腾讯云账号 ID | Docker 用户名 |
| `TENCENT_DOCKER_PASSWORD` | 访问令牌 | Docker 密码 |

---

## 第二步：提交代码并触发自动部署

### 2.1 本地提交代码

```bash
cd /Users/angusliu/Desktop/code/Jianshen/Jianshen/RocketBird

# 确保所有文件已提交
git add .

# 提交代码
git commit -m "feat: 添加容器型服务部署配置和 GitHub Actions 工作流"

# 推送到 GitHub main 分支
git push origin main
```

### 2.2 监看工作流执行

1. 打开 GitHub Actions
   - https://github.com/Angus1976/jianshen01/actions

2. 点击最新的工作流「部署 RocketBird 到 TCB 容器型服务」

3. 查看构建进度
   - 检出代码 ✓
   - 安装依赖 ✓
   - 编译各模块 ✓
   - 构建 Docker 镜像 ✓
   - 推送镜像 ✓

构建通常需要 5-10 分钟。

---

## 第三步：在 TCB 创建容器型服务

### 3.1 打开 TCB 云托管

1. 打开腾讯云 CloudBase 控制台
   - https://console.cloud.tencent.com/tcb

2. 选择环境：`cloud1-4g2aaqb40446a63b`

3. 左侧菜单 → 「云托管」→ 「服务管理」

### 3.2 创建新服务

1. 点击「新建云托管服务」

2. 填写服务配置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 服务名 | `rocketbird-api` | 服务唯一名称 |
| 部署方式 | 使用镜像 | 选择从镜像部署 |
| 镜像仓库 | ccr.ccs.tencentyun.com | 腾讯云容器仓库 |
| 镜像地址 | `ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest` | GitHub Actions 推送的镜像 |
| 镜像版本 | `latest` | 始终使用最新版本 |
| 端口 | `8000` | 应用启动端口 |
| CPU | `500m` | CPU 资源 |
| 内存 | `1GB` | 内存资源 |
| 初始实例数 | `1` | 启动 1 个实例 |

### 3.3 配置环境变量

点击「高级配置」→ 「环境变量」，添加：

```
NODE_ENV=production
TCB_ENV_ID=cloud1-4g2aaqb40446a63b
PORT=8000
```

### 3.4 配置健康检查

点击「高级配置」→ 「健康检查」：

| 配置项 | 值 |
|--------|-----|
| 检查路径 | `/api/health` |
| 初始延迟 | `5` 秒 |
| 超时时间 | `10` 秒 |
| 检查间隔 | `30` 秒 |

### 3.5 部署服务

1. 点击「部署」按钮

2. 等待部署完成（通常 2-5 分钟）

3. 查看服务访问 URL

---

## 第四步：验证部署成功

### 4.1 测试 API

```bash
# 获取服务 URL（从 TCB 控制台复制）
TCB_URL="https://<your-tcb-domain>"

# 测试健康检查
curl ${TCB_URL}/api/health

# 测试登录
curl -X POST ${TCB_URL}/api/auth/password-login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'
```

### 4.2 访问前端应用

- **H5 应用**: https://&lt;your-tcb-domain&gt;/h5
- **管理后台**: https://&lt;your-tcb-domain&gt;/admin
- **默认首页**: https://&lt;your-tcb-domain&gt;/

### 4.3 查看服务日志

在 TCB 控制台查看容器日志：
- 云托管 → 服务详情 → 日志

---

## 第五步：自动化更新配置

### 5.1 配置自动更新镜像

TCB 可以配置在镜像更新后自动部署：

1. TCB 云托管 → 服务详情 → 编辑配置

2. 启用「镜像自动更新」

3. 选择「始终拉取最新镜像」

这样每次 GitHub Actions 推送新镜像时，TCB 会自动部署。

### 5.2 配置滚动更新

1. TCB 云托管 → 服务详情 → 编辑配置

2. 部署策略 → 「滚动更新」

3. 配置：
   - 保留旧版本：1 个
   - 新版本实例数：1 个
   - 最小可用实例数：1 个

这样更新时会零停机时间。

---

## 部署验证清单

- [ ] GitHub Secrets 已配置（TENCENT_DOCKER_USERNAME、TENCENT_DOCKER_PASSWORD）
- [ ] 代码已推送到 GitHub main 分支
- [ ] GitHub Actions 工作流成功完成
- [ ] Docker 镜像已推送到腾讯云 CCR
- [ ] TCB 容器型服务已创建
- [ ] 环境变量已配置
- [ ] 健康检查已配置
- [ ] API 测试成功 (`/api/health`)
- [ ] H5 应用可访问
- [ ] 管理后台可访问
- [ ] 用户登录功能正常
- [ ] 数据库连接正常

---

## 持续集成流程

### 每次代码更新：

1. **提交代码**
   ```bash
   git add .
   git commit -m "具体的改动说明"
   git push origin main
   ```

2. **自动构建** (GitHub Actions)
   - 自动运行工作流
   - 构建新镜像
   - 推送到 CCR

3. **自动部署** (TCB)
   - 如启用自动更新
   - 自动拉取新镜像
   - 滚动更新应用
   - 零停机时间

---

## 故障排除

### GitHub Actions 构建失败

1. 打开工作流日志
   - GitHub → Actions → 查看具体步骤的输出

2. 常见原因：
   - 依赖安装失败：检查 `yarn.lock` 是否最新
   - 编译错误：本地验证代码能否编译
   - 镜像推送失败：检查 Secrets 是否正确

### TCB 部署失败

1. 检查服务日志
   - TCB 控制台 → 云托管 → 服务详情 → 日志

2. 常见原因：
   - 镜像地址错误
   - 环境变量缺失
   - 健康检查失败
   - 资源不足

### 应用无法访问

1. 检查服务状态
   - TCB 控制台确认服务是否「运行中」

2. 检查网络配置
   - 确认已配置公网 IP
   - 检查防火墙规则

3. 测试容器内部
   - 使用远程调试功能
   - 检查容器日志

---

## 回滚方案

### 快速回滚到上一版本

1. TCB 云托管 → 服务详情 → 版本历史

2. 找到上一个稳定版本

3. 点击「回滚」

或者使用具体的镜像版本：

```yaml
# 修改 .github/workflows/deploy-to-tcb.yml
# 将 latest 改为具体版本
tags: |
  ${{ env.REGISTRY }}/${{ env.REGISTRY_NAMESPACE }}/${{ env.IMAGE_NAME }}:v1.0.0
```

---

## 下一步

1. ✅ 配置 GitHub Secrets
2. ✅ 提交代码触发自动构建
3. ✅ 创建 TCB 容器型服务
4. ✅ 配置自动更新
5. ✅ 监控和维护应用

---

**部署完成后，应用将自动更新，100% 就绪！** 🚀
