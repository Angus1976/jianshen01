#!/bin/bash

# RocketBird TCB 云函数部署脚本 (基于 TCB CLI v1)
# 参考: https://docs.cloudbase.net/cli-v1/functions/deploy

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  RocketBird TCB 云函数部署脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# 从 .env.local 读取配置
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ 错误: .env.local 文件不存在${NC}"
    exit 1
fi

export $(grep -v '^#' .env.local | xargs)

if [ -z "$TCB_ENV_ID" ] || [ -z "$TCB_SECRET_ID" ] || [ -z "$TCB_SECRET_KEY" ]; then
    echo -e "${RED}✗ 错误: 环境变量不完整${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境变量已加载${NC}"
echo "  环境 ID: $TCB_ENV_ID\n"

# 检查 tcb 命令
if ! command -v tcb &> /dev/null; then
    echo -e "${RED}✗ 错误: tcb CLI 未安装${NC}"
    echo "请运行: npm install -g @cloudbase/cli"
    exit 1
fi

echo -e "${GREEN}✓ tcb CLI 已安装${NC}\n"

# 第1步: 登录
echo -e "${YELLOW}[步骤 1/4] 登录 TCB CLI...${NC}"
tcb login --secretId "$TCB_SECRET_ID" --secretKey "$TCB_SECRET_KEY" > /dev/null 2>&1 || true
echo -e "${GREEN}✓ 已登录${NC}\n"

# 第2步: 编译 TypeScript
echo -e "${YELLOW}[步骤 2/4] 编译云函数代码...${NC}"
cd packages/server

if [ ! -f package.json ]; then
    echo -e "${RED}✗ 错误: packages/server/package.json 不存在${NC}"
    exit 1
fi

# 编译
if [ -f tsconfig.json ]; then
    echo "  使用 tsc 编译..."
    npx tsc --listFiles 2>/dev/null || yarn tsc 2>/dev/null || npm run build 2>/dev/null || true
fi

if [ ! -f dist/app.js ]; then
    echo -e "${RED}✗ 错误: 编译失败，dist/app.js 不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 编译完成${NC}\n"

# 第3步: 生成 cloudbaserc.json
echo -e "${YELLOW}[步骤 3/4] 生成 cloudbaserc.json...${NC}"

cat > cloudbaserc.json << EOF
{
  "envId": "$TCB_ENV_ID",
  "functions": [
    {
      "name": "api",
      "runtime": "Nodejs10.15",
      "handler": "app.main",
      "timeout": 30,
      "memorySize": 512,
      "installDependency": true,
      "ignore": [
        "node_modules",
        "node_modules/**/*",
        ".git"
      ]
    }
  ]
}
EOF

echo "  cloudbaserc.json 已生成"
cat cloudbaserc.json | jq '.' 2>/dev/null || cat cloudbaserc.json
echo -e "${GREEN}✓ 配置文件已生成${NC}\n"

# 第4步: 部署云函数
echo -e "${YELLOW}[步骤 4/4] 部署云函数...${NC}"
echo "  函数: api"
echo "  运行时: Node.js 10.15"
echo "  入口: dist/app.js"
echo "  超时: 30s"
echo "  内存: 512MB\n"

# 使用 tcb fn deploy 命令
tcb fn deploy api -e "$TCB_ENV_ID" --force

echo ""
echo -e "${GREEN}✓ 云函数部署完成${NC}\n"

# 部署完成提示
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 部署成功！${NC}\n"

echo -e "📋 部署信息:"
echo "  环境: $TCB_ENV_ID"
echo "  函数: api"
echo "  入口: dist/app.js"
echo "  状态: 已部署"
echo ""

echo -e "⏭️  后续步骤:"
echo "  1. 查看云函数日志:"
echo "     tcb fn log api -e $TCB_ENV_ID --follow"
echo ""
echo "  2. 验证部署:"
echo "     cd ../.."
echo "     python3 scripts/verify-deployment.py"
echo ""
echo "  3. 测试 API (HTTP 触发器配置完成后):"
echo "     curl -X POST 'https://<domain>/api/auth/password-login' \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"phone\":\"13800000001\",\"password\":\"123456\"}'"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
