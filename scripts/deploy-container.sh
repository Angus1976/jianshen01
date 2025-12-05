#!/bin/bash

# RocketBird 容器型服务部署脚本
# 构建 Docker 镜像并部署到 TCB 容器型服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 从 .env.local 读取配置
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ 错误: .env.local 文件不存在${NC}"
    exit 1
fi

export $(grep -v '^#' .env.local | xargs)

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  RocketBird 容器型服务部署脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# 配置变量
IMAGE_NAME="rocketbird-app"
IMAGE_TAG="latest"
TCB_REGISTRY="ccr.ccs.tencentyun.com"  # 腾讯云容器仓库
REGISTRY_NAMESPACE="rocketbird"
SERVICE_NAME="rocketbird-api"
PORT=8000

echo -e "${YELLOW}[步骤 1/5] 验证环境...${NC}"

# 检查必要的命令
for cmd in docker tcb; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}✗ 错误: $cmd 未安装${NC}"
        echo "请运行:"
        [ "$cmd" = "docker" ] && echo "  brew install docker" || echo "  npm install -g @cloudbase/cli"
        exit 1
    fi
done

echo -e "${GREEN}✓ 环境检查完成${NC}\n"

echo -e "${YELLOW}[步骤 2/5] 构建 Docker 镜像...${NC}"

# 构建镜像
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile . \
  --build-arg NODE_ENV=production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 镜像构建完成${NC}\n"
else
    echo -e "${RED}✗ 镜像构建失败${NC}"
    exit 1
fi

echo -e "${YELLOW}[步骤 3/5] 登录 TCB...${NC}"

# 登录 TCB
tcb login --secretId "$TCB_SECRET_ID" --secretKey "$TCB_SECRET_KEY" > /dev/null 2>&1

echo -e "${GREEN}✓ 已登录 TCB${NC}\n"

echo -e "${YELLOW}[步骤 4/5] 创建或更新容器型服务...${NC}"

# 创建 cloudbaserc.json 配置文件（容器型服务）
cat > cloudbaserc.container.json << 'EOF'
{
  "envId": "cloud1-4g2aaqb40446a63b",
  "services": [
    {
      "name": "rocketbird-api",
      "type": "container",
      "runtime": "docker",
      "image": "rocketbird-app:latest",
      "port": 8000,
      "cpu": 500,
      "memory": 1024,
      "envVariables": {
        "NODE_ENV": "production",
        "TCB_ENV_ID": "cloud1-4g2aaqb40446a63b",
        "PORT": "8000"
      },
      "healthCheck": {
        "path": "/api/health",
        "initialDelay": 5,
        "timeout": 10,
        "interval": 30
      }
    }
  ]
}
EOF

# 注: 实际部署需要通过 TCB 控制台或使用腾讯云 CLI
# 以下是使用 tcb CLI 的尝试（可能需要调整参数）

echo -e "${YELLOW}请通过以下方式部署容器：${NC}\n"

echo "方式 1: 使用 TCB 控制台"
echo "  1. 打开 https://console.cloud.tencent.com/tcb"
echo "  2. 选择环境: $TCB_ENV_ID"
echo "  3. 左侧「云托管」→「服务管理」"
echo "  4. 点击「创建服务」"
echo "  5. 选择「使用镜像」，上传或指定镜像"
echo "  6. 配置端口: $PORT"
echo "  7. 部署\n"

echo "方式 2: 使用本地 Docker 运行测试"
echo "  docker run -d -p $PORT:$PORT \\"
echo "    -e TCB_ENV_ID=$TCB_ENV_ID \\"
echo "    -e NODE_ENV=production \\"
echo "    --name rocketbird-app \\"
echo "    ${IMAGE_NAME}:${IMAGE_TAG}\n"

echo "方式 3: 推送到镜像仓库（推荐用于生产）"
echo "  docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${TCB_REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
echo "  docker push ${TCB_REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}\n"

echo -e "${YELLOW}[步骤 5/5] 测试本地容器...${NC}"

# 尝试在本地运行容器测试
if [ "$1" = "--test" ]; then
    echo "启动本地容器测试..."
    
    docker rm -f rocketbird-test 2>/dev/null || true
    
    docker run -d \
      --name rocketbird-test \
      -p $PORT:$PORT \
      -e TCB_ENV_ID="$TCB_ENV_ID" \
      -e NODE_ENV=production \
      ${IMAGE_NAME}:${IMAGE_TAG}
    
    echo "等待容器启动..."
    sleep 5
    
    # 测试 API
    if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 容器测试成功！${NC}\n"
    else
        echo -e "${YELLOW}⚠ 容器可能未完全启动，请检查日志:${NC}"
        docker logs rocketbird-test
    fi
    
    echo "停止测试容器..."
    docker stop rocketbird-test
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ 容器构建完成！${NC}\n"

echo "📋 后续步骤："
echo "  1. 推送镜像到腾讯云容器仓库（可选）"
echo "  2. 在 TCB 控制台创建容器型服务"
echo "  3. 配置 HTTP 触发器"
echo "  4. 测试 API 和前端应用\n"

echo "📱 应用访问地址（部署完成后）："
echo "  H5 应用: https://<tcb-domain>/h5"
echo "  管理后台: https://<tcb-domain>/admin"
echo "  API 地址: https://<tcb-domain>/api\n"

echo -e "${BLUE}════════════════════════════════════════${NC}"
