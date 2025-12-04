# RocketBird 部署文档

## 系统概述
RocketBird 是一个基于腾讯云 CloudBase 的全栈健身管理平台，包含会员端 H5、管理后台和后端 API。

## 部署架构

### 整体架构
- **前端部署**：腾讯云 CloudBase (TCB) 静态网站托管
- **后端部署**：腾讯云 CloudBase 云函数 (SCF)
- **数据库**：MongoDB (通过连接字符串访问)

### 具体部署方式

#### 1. 前端部署
- **会员端 H5**：部署到 TCB 静态网站托管根路径 `/`
- **管理后台**：部署到 TCB 静态网站托管子路径 `/admin`
- **构建工具**：
  - 管理后台：Vite + React + Ant Design
  - 会员端 H5：uni-app + Vue 3
- **访问地址**：
  - 会员端：https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
  - 管理后台：https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/admin

#### 2. 后端部署
- **运行环境**：Node.js 10.15 (云函数)
- **框架**：Express.js + TypeScript
- **部署工具**：CloudBase Framework
- **API 路径**：`/api/*` (通过云函数路由)
- **环境变量**：
  - TCB_ENV_ID
  - MONGODB_URI
  - JWT_SECRET

#### 3. 数据库
- **类型**：MongoDB
- **连接方式**：通过 MONGODB_URI 环境变量
- **访问**：后端云函数直接连接数据库

#### 4. 部署流程
1. 本地构建所有项目 (`yarn build:all`)
2. 使用部署脚本 (`./scripts/deploy-tcb.sh`) 批量部署
3. 支持分步部署 (H5/管理后台/服务器)

#### 5. CI/CD (可选)
- GitHub Actions 配置已准备 (`.github/workflows/deploy-tcb.yml`)
- 支持推送到 main 分支自动部署

### 环境配置
- **生产环境**：`.env`
- **开发环境**：`.env.local` (复刻生产环境)

### 管理员账号
- 用户名：admin
- 密码：admin123

### 部署命令
```bash
# 安装依赖
yarn install

# 构建所有项目
yarn build:all

# 部署所有服务
./scripts/deploy-tcb.sh

# 分步部署
./scripts/deploy-tcb.sh h5      # 仅部署会员端 H5
./scripts/deploy-tcb.sh admin   # 仅部署管理后台
./scripts/deploy-tcb.sh server  # 仅部署后端服务
```

### 优势
- **无服务器架构**：自动扩缩容，高可用性
- **低成本**：按量计费，无需维护服务器
- **快速部署**：一键部署脚本
- **安全**：腾讯云安全保障

### 注意事项
- 个人版环境不支持云托管，仅支持云函数
- 数据库需要提前创建并配置连接字符串
- JWT_SECRET 已自动生成，请妥善保管