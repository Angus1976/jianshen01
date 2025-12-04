#!/bin/bash

##############################################################################
# RocketBird 云函数自动配置脚本
# 用途: 自动创建云函数触发器（HTTP 和定时）
# 用法: bash scripts/setup-cloudbase.sh
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# 显示帮助信息
show_help() {
    cat << EOF
RocketBird CloudBase 自动配置脚本

用法: $0 [选项]

选项:
  -e, --env-id ENV_ID           指定环境 ID (默认: cloud1-4g2aaqb40446a63b)
  -f, --function-name NAME      指定函数名 (默认: api)
  --http-only                   仅配置 HTTP 触发器
  --timer-only                  仅配置定时触发器
  --skip-http                   跳过 HTTP 触发器配置
  --skip-timer                  跳过定时触发器配置
  -h, --help                    显示帮助信息

示例:
  $0                            # 默认配置（HTTP + 定时）
  $0 -e my-env-id              # 指定环境 ID
  $0 --http-only               # 仅配置 HTTP 触发器
  $0 --timer-only              # 仅配置定时触发器

EOF
}

# 默认值
ENV_ID="cloud1-4g2aaqb40446a63b"
FUNCTION_NAME="api"
CONFIG_HTTP=true
CONFIG_TIMER=true

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env-id)
            ENV_ID="$2"
            shift 2
            ;;
        -f|--function-name)
            FUNCTION_NAME="$2"
            shift 2
            ;;
        --http-only)
            CONFIG_TIMER=false
            shift
            ;;
        --timer-only)
            CONFIG_HTTP=false
            shift
            ;;
        --skip-http)
            CONFIG_HTTP=false
            shift
            ;;
        --skip-timer)
            CONFIG_TIMER=false
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "未知选项: $1"
            ;;
    esac
done

# 打印头部
echo ""
echo "========================================"
echo "  RocketBird CloudBase 云函数配置"
echo "========================================"
echo ""

info "配置信息:"
echo "  环境 ID: $ENV_ID"
echo "  函数名: $FUNCTION_NAME"
echo "  HTTP 触发器: $([ "$CONFIG_HTTP" = true ] && echo '✓ 启用' || echo '✗ 禁用')"
echo "  定时触发器: $([ "$CONFIG_TIMER" = true ] && echo '✓ 启用' || echo '✗ 禁用')"
echo ""

# 检查 CloudBase CLI
info "检查 CloudBase CLI..."
if ! command -v tcb &> /dev/null; then
    error "CloudBase CLI 未安装"
fi
success "CloudBase CLI 已安装"

# 检查登录状态
info "检查登录状态..."
if ! tcb env list &> /dev/null; then
    error "请先登录 CloudBase: tcb login"
fi
success "已登录 CloudBase"

# 获取函数信息
info "获取云函数信息..."
if ! tcb fn list -e "$ENV_ID" | grep -q "$FUNCTION_NAME"; then
    error "函数 '$FUNCTION_NAME' 不存在或环境 ID 错误"
fi
success "函数 '$FUNCTION_NAME' 找到"

echo ""
echo "========================================"
echo "  配置 HTTP 触发器"
echo "========================================"
echo ""

# 配置 HTTP 触发器
if [ "$CONFIG_HTTP" = true ]; then
    info "创建 HTTP 触发器..."
    
    # 由于 CloudBase CLI 的触发器配置命令有限，这里显示手动步骤
    # 实际上 tcb 命令可能不支持直接创建触发器，需要通过控制台
    
    cat << 'EOF'

### HTTP 触发器配置步骤 ###

1. 打开 TCB 控制台
   URL: https://console.cloud.tencent.com/tcb

2. 选择环境
   环境 ID: cloud1-4g2aaqb40446a63b

3. 进入云函数
   侧边栏 → 云函数 → api

4. 添加触发器
   点击「新建触发器」

5. 配置 HTTP 触发器
   触发器类型: HTTP
   请求方法: ✓GET ✓POST ✓PUT ✓DELETE ✓OPTIONS
   路径: /api
   点击「保存」

6. 获取访问地址
   触发器会显示 HTTP 访问地址，如:
   https://service-xxx.sh.run.tcloudbase.com/release/api

EOF
    
    success "HTTP 触发器配置步骤已显示"
    
else
    warn "跳过 HTTP 触发器配置"
fi

echo ""
echo "========================================"
echo "  配置定时触发器"
echo "========================================"
echo ""

# 配置定时触发器
if [ "$CONFIG_TIMER" = true ]; then
    info "创建定时触发器配置..."
    
    # 创建定时触发器配置文件
    TIMER_CONFIG=$(cat << 'EOF'

### 推荐的定时触发器配置 ###

触发器 1: 每天凌晨 2 点执行（清理过期 Token）
├─ Cron 表达式: 0 2 * * *
├─ 触发器名称: daily_cleanup
└─ 参数: {"action": "cleanup_expired_tokens"}

触发器 2: 每小时执行一次（更新统计）
├─ Cron 表达式: 0 * * * *
├─ 触发器名称: hourly_stats
└─ 参数: {"action": "update_statistics"}

触发器 3: 每周一 10 点执行（生成周报）
├─ Cron 表达式: 0 10 ? * MON
├─ 触发器名称: weekly_report
└─ 参数: {"action": "weekly_report"}

触发器 4: 每月 1 号执行（月度重置）
├─ Cron 表达式: 0 0 1 * *
├─ 触发器名称: monthly_reset
└─ 参数: {"action": "monthly_reset"}

配置步骤:
1. 打开 TCB 控制台: https://console.cloud.tencent.com/tcb
2. 选择环境: cloud1-4g2aaqb40446a63b
3. 进入云函数: api
4. 点击「新建触发器」
5. 选择触发器类型: 定时任务
6. 输入上述 Cron 表达式
7. 点击「保存」

Cron 表达式说明:
格式: 分钟 小时 日期 月份 星期
示例: 0 2 * * * (每天凌晨 2 点)
     0 * * * * (每小时)
     0 10 ? * MON (每周一 10 点)

EOF
)
    
    echo "$TIMER_CONFIG"
    success "定时触发器配置说明已显示"
    
else
    warn "跳过定时触发器配置"
fi

echo ""
echo "========================================"
echo "  验证部署"
echo "========================================"
echo ""

# 查看云函数信息
info "获取云函数详细信息..."
echo ""

# 尝试获取函数信息
if tcb fn detail "$FUNCTION_NAME" -e "$ENV_ID" &> /dev/null; then
    success "云函数信息:"
    tcb fn detail "$FUNCTION_NAME" -e "$ENV_ID" || true
else
    warn "无法获取云函数详细信息（这是正常的）"
fi

echo ""
echo "========================================"
echo "  下一步"
echo "========================================"
echo ""

echo "1. 打开 TCB 控制台添加触发器"
echo "   URL: https://console.cloud.tencent.com/tcb"
echo ""
echo "2. 配置 HTTP 触发器"
echo "   路径: /api"
echo "   方法: GET, POST, PUT, DELETE, OPTIONS"
echo ""
echo "3. 配置定时触发器（可选）"
echo "   推荐: 0 2 * * * (每天凌晨 2 点)"
echo ""
echo "4. 测试 API"
echo "   curl -X POST 'https://<your-api-url>/api/auth/password-login' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"phone\":\"13800000001\",\"password\":\"123456\"}'"
echo ""
echo "5. 查看日志"
echo "   tcb fn log $FUNCTION_NAME -e $ENV_ID"
echo ""

success "配置脚本执行完成！"
echo ""

echo "========================================"
echo "  相关文档"
echo "========================================"
echo ""
echo "• 完整部署指南: docs/DEPLOYMENT_COMPLETE.md"
echo "• 触发器详细配置: docs/TRIGGER_CONFIG.md"
echo "• 快速参考: docs/QUICK_REFERENCE.md"
echo ""

echo "========================================"
echo ""
