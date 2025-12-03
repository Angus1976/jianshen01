# 腾讯云 TCB (云开发) 部署指南

本文档介绍如何将 RocketBird 全部服务部署到腾讯云云开发 (CloudBase)。

## 项目结构

| 包 | 说明 | 部署方式 |
|---|---|---|
| `packages/member-h5` | 会员端 H5 | 静态网站托管 (/) |
| `packages/admin` | 管理后台 | 静态网站托管 (/admin) |
| `packages/server` | 后端 API | 云托管 / 云函数 |

## 前置条件

1. 拥有腾讯云账号
2. 已开通云开发服务
3. 已安装 Node.js >= 18.0.0
4. 已安装 Yarn >= 1.22.0

## 一、安装 CloudBase CLI

```bash
npm install -g @cloudbase/cli
```

## 二、登录腾讯云

```bash
# 方式1: 交互式登录（推荐）
tcb login

# 方式2: 使用密钥登录（适用于 CI/CD）
tcb login --apiKeyId <your-api-key-id> --apiKey <your-api-key>
```

## 三、创建云开发环境

如果还没有云开发环境，可以通过以下方式创建：

1. 登录 [腾讯云云开发控制台](https://console.cloud.tencent.com/tcb)
2. 点击「新建环境」
3. 选择「按量计费」模式（有免费额度）
4. 记录环境 ID（如 `rocketbird-xxx`）

## 四、配置环境变量

在项目根目录创建 `.env` 文件（请勿提交到 Git）：

```bash
# .env
TCB_ENV_ID=your-env-id

# Server 环境变量
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

## 五、一键构建所有项目

```bash
# 在项目根目录执行
yarn install
yarn build:all
```

或分别构建：

```bash
yarn build:shared   # 先构建共享包
yarn build:h5       # 会员端 H5
yarn build:admin    # 管理后台
yarn build:server   # 后端服务
```

## 六、部署所有服务

### 方式1: 脚本一键部署

创建部署脚本 `scripts/deploy-tcb.sh`：

```bash
#!/bin/bash
set -e

# 检查环境变量
if [ -z "$TCB_ENV_ID" ]; then
  echo "Error: TCB_ENV_ID is not set"
  exit 1
fi

echo "🚀 开始部署到腾讯云 TCB..."
echo "环境 ID: $TCB_ENV_ID"

# 1. 部署会员端 H5
echo ""
echo "📱 部署会员端 H5..."
tcb hosting deploy ./packages/member-h5/dist/build/h5 / -e $TCB_ENV_ID

# 2. 部署管理后台
echo ""
echo "🖥️  部署管理后台..."
tcb hosting deploy ./packages/admin/dist /admin -e $TCB_ENV_ID

# 3. 部署后端服务 (云托管)
echo ""
echo "⚙️  部署后端服务..."
cd packages/server
tcb run deploy -e $TCB_ENV_ID
cd ../..

echo ""
echo "✅ 部署完成!"
echo ""
echo "访问地址:"
tcb hosting detail -e $TCB_ENV_ID
```

执行部署：

```bash
chmod +x scripts/deploy-tcb.sh
./scripts/deploy-tcb.sh
```

### 方式2: 手动分步部署

#### 6.1 部署会员端 H5

```bash
tcb hosting deploy ./packages/member-h5/dist/build/h5 / -e $TCB_ENV_ID
```

#### 6.2 部署管理后台

```bash
tcb hosting deploy ./packages/admin/dist /admin -e $TCB_ENV_ID
```

#### 6.3 部署后端服务

**选项 A: 云托管（推荐）**

```bash
cd packages/server
tcb run deploy -e $TCB_ENV_ID
```

**选项 B: 云函数**

```bash
cd packages/server
tcb fn deploy api -e $TCB_ENV_ID
```

## 七、配置路由和域名

### 7.1 配置单页应用路由

在云开发控制台 > 静态网站托管 > 设置：

1. 设置「错误页面」为 `/index.html`（会员端）
2. 为 `/admin` 路径设置错误页面为 `/admin/index.html`

### 7.2 配置自定义域名（可选）

1. 进入 [云开发控制台](https://console.cloud.tencent.com/tcb) > 静态网站托管
2. 点击「设置」>「自定义域名」
3. 添加已备案的域名
4. 配置 CNAME 解析

建议的域名规划：
- `m.example.com` → 会员端 H5
- `admin.example.com` → 管理后台
- `api.example.com` → 后端 API

## 八、CI/CD 自动部署

### GitHub Actions 完整工作流

在 `.github/workflows/deploy-tcb.yml` 创建：

```yaml
name: Deploy to TCB

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: 'Deploy target'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - h5
          - admin
          - server

env:
  TCB_ENV_ID: ${{ secrets.TCB_ENV_ID }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build shared
        run: yarn build:shared

      - name: Build H5
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'h5' || github.event_name == 'push'
        run: yarn build:h5
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: Build Admin
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'admin' || github.event_name == 'push'
        run: yarn build:admin
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: Build Server
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'server' || github.event_name == 'push'
        run: yarn build:server

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: |
            packages/member-h5/dist/
            packages/admin/dist/
            packages/server/dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: packages/

      - name: Install CloudBase CLI
        run: npm install -g @cloudbase/cli

      - name: Login to TCB
        run: tcb login --apiKeyId ${{ secrets.TCB_API_KEY_ID }} --apiKey ${{ secrets.TCB_API_KEY }}

      - name: Deploy H5
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'h5' || github.event_name == 'push'
        run: tcb hosting deploy ./packages/member-h5/dist/build/h5 / -e $TCB_ENV_ID

      - name: Deploy Admin
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'admin' || github.event_name == 'push'
        run: tcb hosting deploy ./packages/admin/dist /admin -e $TCB_ENV_ID

      - name: Deploy Server
        if: github.event.inputs.deploy_target == 'all' || github.event.inputs.deploy_target == 'server' || github.event_name == 'push'
        run: |
          cd packages/server
          tcb run deploy -e $TCB_ENV_ID
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

### 配置 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置：

| Secret | 说明 |
|--------|------|
| `TCB_ENV_ID` | 云开发环境 ID |
| `TCB_API_KEY_ID` | 腾讯云 API 密钥 ID |
| `TCB_API_KEY` | 腾讯云 API 密钥 |
| `VITE_API_BASE_URL` | 后端 API 地址 |
| `MONGODB_URI` | MongoDB 连接字符串 |
| `JWT_SECRET` | JWT 密钥 |

## 九、常用命令

```bash
# 查看静态网站部署状态
tcb hosting list -e $TCB_ENV_ID

# 查看云托管服务状态
tcb run list -e $TCB_ENV_ID

# 查看云函数列表
tcb fn list -e $TCB_ENV_ID

# 查看云函数日志
tcb fn log api -e $TCB_ENV_ID

# 删除静态网站指定路径
tcb hosting delete /admin -e $TCB_ENV_ID --dir

# 查看访问域名
tcb hosting detail -e $TCB_ENV_ID
```

## 十、环境变量配置

### 云托管环境变量

在云开发控制台 > 云托管 > 服务设置中配置：

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 云函数环境变量

```bash
tcb fn config update api --envVariables '{"MONGODB_URI":"xxx","JWT_SECRET":"xxx"}' -e $TCB_ENV_ID
```

## 故障排查

### 静态网站 404
- 检查是否正确配置了单页应用的错误页面
- 确认文件已成功上传：`tcb hosting list -e $TCB_ENV_ID`

### 后端接口 502/504
- 检查云托管/云函数日志
- 确认环境变量配置正确
- 检查数据库连接是否正常

### 跨域问题
- 后端已配置 CORS，确认 `Access-Control-Allow-Origin` 包含前端域名
- 云托管需要在服务设置中配置允许的域名

### 部署失败
- 检查 `TCB_ENV_ID` 是否正确
- 确认已登录腾讯云 CLI：`tcb env list`
- 检查构建产物目录是否存在
