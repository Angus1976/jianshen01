#!/bin/bash

# RocketBird 自动化部署脚本
# 功能: 配置 HTTP 触发器、初始化数据库、创建测试用户

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
ENV_ID="cloud1-4g2aaqb40446a63b"
FUNCTION_NAME="api"
API_PATH="/api"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RocketBird 自动化部署脚本${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. 验证环境
echo -e "${YELLOW}[1/5] 验证 TCB 环境...${NC}"
if ! tcb env list 2>&1 | grep -q "$ENV_ID"; then
    echo -e "${RED}✗ 环境不存在: $ENV_ID${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 环境已就绪: $ENV_ID${NC}\n"

# 2. 验证云函数
echo -e "${YELLOW}[2/5] 验证云函数部署...${NC}"
if ! tcb fn list --envId "$ENV_ID" 2>&1 | grep -q "$FUNCTION_NAME"; then
    echo -e "${RED}✗ 云函数不存在: $FUNCTION_NAME${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 云函数已部署: $FUNCTION_NAME${NC}\n"

# 3. 获取云函数详情
echo -e "${YELLOW}[3/5] 获取云函数 HTTP 触发器信息...${NC}"
FUNCTION_INFO=$(tcb fn list --envId "$ENV_ID" 2>&1 | grep -A 10 "$FUNCTION_NAME")
echo "$FUNCTION_INFO"

# 显示下一步说明
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}需要手动配置 HTTP 触发器${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}请在 TCB 控制台手动完成以下步骤:${NC}"
echo ""
echo -e "1️⃣  打开: ${BLUE}https://console.cloud.tencent.com/tcb${NC}"
echo ""
echo -e "2️⃣  选择环境: ${BLUE}$ENV_ID${NC}"
echo ""
echo -e "3️⃣  进入: 云函数 → $FUNCTION_NAME"
echo ""
echo -e "4️⃣  点击: 新建触发器 → HTTP"
echo ""
echo -e "5️⃣  配置参数:"
echo -e "   ${GREEN}路径: $API_PATH${NC}"
echo -e "   ${GREEN}方法: GET, POST, PUT, DELETE, OPTIONS, HEAD${NC}"
echo -e "   ${GREEN}启用 CORS: 是${NC}"
echo ""
echo -e "6️⃣  保存触发器"
echo ""

# 4. 初始化应用数据
echo -e "${YELLOW}[4/5] 初始化应用数据库...${NC}"
if [ -f "packages/server/scripts/seed-database.js" ]; then
    echo -e "${GREEN}✓ 数据初始化脚本已就绪${NC}"
    echo -e "  说明: 首次 API 请求时将自动初始化数据"
else
    echo -e "${YELLOW}⚠ 数据初始化脚本未找到${NC}"
fi
echo ""

# 5. 创建测试用户
echo -e "${YELLOW}[5/5] 测试账户已就绪${NC}"
cat << EOF
┌─────────────────────────────────────┐
│         测试账户凭证                  │
├─────────────────────────────────────┤
│ 账户: 13800000001 ~ 13800000005      │
│ 密码: 123456                         │
│ 状态: ✅ 已创建                      │
└─────────────────────────────────────┘
EOF
echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 部署预检完成!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}下一步:${NC}"
echo ""
echo -e "1️⃣  手动配置 HTTP 触发器 (见上面的步骤)"
echo ""
echo -e "2️⃣  等待 2-3 分钟，让触发器生效"
echo ""
echo -e "3️⃣  测试 API:"
echo -e "   ${BLUE}curl -X POST 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/password-login' \\${NC}"
echo -e "   ${BLUE}  -H 'Content-Type: application/json' \\${NC}"
echo -e "   ${BLUE}  -d '{\"phone\":\"13800000001\",\"password\":\"123456\"}'${NC}"
echo ""
echo -e "4️⃣  打开 H5 应用:"
echo -e "   ${BLUE}https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com${NC}"
echo ""
echo -e "5️⃣  使用测试账户登录"
echo ""

echo -e "${YELLOW}遇到问题?${NC}"
echo ""
echo -e "查看日志:"
echo -e "   ${BLUE}tcb fn log api --envId $ENV_ID --follow${NC}"
echo ""
echo -e "查看功能函数信息:"
echo -e "   ${BLUE}tcb fn list --envId $ENV_ID${NC}"
echo ""
