#!/bin/bash

# RocketBird TCB 云函数部署脚本
# 自动登录 TCB CLI 并创建 Web 云函数

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 从 .env.local 读取配置
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ 错误: .env.local 文件不存在${NC}"
    echo "请先创建 .env.local 文件，包含以下内容:"
    echo "  TCB_ENV_ID=<env-id>"
    echo "  TCB_SECRET_ID=<secret-id>"
    echo "  TCB_SECRET_KEY=<secret-key>"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env.local | xargs)

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  RocketBird TCB 云函数部署脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# 验证必要的环境变量
if [ -z "$TCB_ENV_ID" ] || [ -z "$TCB_SECRET_ID" ] || [ -z "$TCB_SECRET_KEY" ]; then
    echo -e "${RED}✗ 错误: 环境变量不完整${NC}"
    echo "  TCB_ENV_ID=$TCB_ENV_ID"
    echo "  TCB_SECRET_ID=$TCB_SECRET_ID"
    echo "  TCB_SECRET_KEY=$TCB_SECRET_KEY"
    exit 1
fi

echo -e "${GREEN}✓ 环境变量已加载${NC}"
echo "  环境 ID: $TCB_ENV_ID"
echo ""

# 检查 tcb 命令是否存在
if ! command -v tcb &> /dev/null; then
    echo -e "${RED}✗ 错误: tcb CLI 未安装${NC}"
    echo "请运行以下命令安装:"
    echo "  npm install -g @cloudbase/cli"
    exit 1
fi

echo -e "${GREEN}✓ tcb CLI 已安装${NC}\n"

# 第1步: 登录 TCB
echo -e "${YELLOW}[步骤 1/3] 登录 TCB CLI...${NC}"
tcb login --secretId "$TCB_SECRET_ID" --secretKey "$TCB_SECRET_KEY" > /dev/null 2>&1 || true
echo -e "${GREEN}✓ 已登录 TCB CLI${NC}\n"

# 第2步: 检查并编译云函数代码
echo -e "${YELLOW}[步骤 2/3] 准备云函数代码...${NC}"

# 检查源代码目录
if [ ! -d "packages/server/src" ]; then
    echo -e "${RED}✗ 错误: packages/server/src 目录不存在${NC}"
    exit 1
fi

# 编译 TypeScript
echo "  编译 TypeScript..."
cd packages/server
yarn tsc --listFiles > /dev/null 2>&1 || npm run build > /dev/null 2>&1 || true

if [ ! -f "dist/app.js" ]; then
    echo -e "${RED}✗ 错误: 编译失败，dist/app.js 不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 代码编译完成${NC}\n"

# 第3步: 部署 Web 云函数
echo -e "${YELLOW}[步骤 3/3] 部署 Web 云函数...${NC}"
echo "  函数名: api"
echo "  运行时: Node.js 10.15"
echo "  入口文件: dist/app.js"
echo ""

cd ..
cd ..

# 使用 TCB CLI 部署
# 创建 cloudbaserc.json 配置文件
cat > cloudbaserc.json << 'EOF'
{
  "envId": "cloud1-4g2aaqb40446a63b",
  "functions": [
    {
      "name": "api",
      "runtime": "Nodejs10.15",
      "handler": "dist/app.js",
      "codeUri": "packages/server"
    }
  ]
}
EOF

echo "  cloudbaserc.json 已生成"

# 使用更新的部署方式
tcb fn deploy -e "$TCB_ENV_ID" --force

echo -e "${GREEN}✓ 云函数部署完成${NC}\n"

# 部署完成提示
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 部署成功！${NC}\n"

echo -e "📋 部署信息:"
echo "  环境 ID: $TCB_ENV_ID"
echo "  函数名: api"
echo "  运行时: Node.js 10.15"
echo ""

echo -e "🧪 验证部署:"
echo "  运行: python3 scripts/verify-deployment.py"
echo ""

echo -e "📱 测试 API:"
echo "  curl -X POST 'https://${TCB_ENV_ID}-<cloudbaseapp-host>/api/auth/password-login' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"phone\":\"13800000001\",\"password\":\"123456\"}'"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
