#!/bin/bash
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
    echo "RocketBird TCB 部署脚本"
    echo ""
    echo "用法: $0 [选项] [目标]"
    echo ""
    echo "目标:"
    echo "  all      部署所有服务 (默认)"
    echo "  h5       仅部署会员端 H5"
    echo "  admin    仅部署管理后台"
    echo "  server   仅部署后端服务"
    echo ""
    echo "选项:"
    echo "  -e, --env-id    指定环境 ID"
    echo "  -b, --build     部署前先构建"
    echo "  -h, --help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 部署所有服务"
    echo "  $0 h5                 # 仅部署 H5"
    echo "  $0 -b all             # 构建并部署所有"
    echo "  $0 -e my-env-id h5    # 指定环境部署 H5"
}

# 默认值
TARGET="all"
BUILD=false
ENV_ID=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -e|--env-id)
            ENV_ID="$2"
            shift 2
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        all|h5|admin|server)
            TARGET="$1"
            shift
            ;;
        *)
            error "未知参数: $1"
            ;;
    esac
done

# 检查环境变量
if [ -z "$ENV_ID" ]; then
    if [ -z "$TCB_ENV_ID" ]; then
        # 尝试从 .env 文件读取
        if [ -f ".env" ]; then
            export $(grep -v '^#' .env | xargs)
        fi

        if [ -z "$TCB_ENV_ID" ]; then
            error "请设置 TCB_ENV_ID 环境变量或使用 -e 参数指定"
        fi
    fi
    ENV_ID="$TCB_ENV_ID"
fi

# 检查 tcb CLI
if ! command -v tcb &> /dev/null; then
    error "请先安装 CloudBase CLI: npm install -g @cloudbase/cli"
fi

echo ""
echo "=========================================="
echo "  RocketBird TCB 部署"
echo "=========================================="
echo ""
info "环境 ID: $ENV_ID"
info "部署目标: $TARGET"
info "构建: $BUILD"
echo ""

# 构建
if [ "$BUILD" = true ]; then
    info "开始构建..."

    yarn build:shared

    if [ "$TARGET" = "all" ] || [ "$TARGET" = "h5" ]; then
        info "构建会员端 H5..."
        yarn build:h5
    fi

    if [ "$TARGET" = "all" ] || [ "$TARGET" = "admin" ]; then
        info "构建管理后台..."
        yarn build:admin
    fi

    if [ "$TARGET" = "all" ] || [ "$TARGET" = "server" ]; then
        info "构建后端服务..."
        yarn build:server
    fi

    success "构建完成"
    echo ""
fi

# 部署会员端 H5
deploy_h5() {
    info "部署会员端 H5..."

    if [ ! -d "packages/member-h5/dist/build/h5" ]; then
        error "H5 构建产物不存在，请先运行 yarn build:h5"
    fi

    tcb hosting deploy ./packages/member-h5/dist/build/h5 / -e "$ENV_ID"
    success "会员端 H5 部署完成"
}

# 部署管理后台
deploy_admin() {
    info "部署管理后台..."

    if [ ! -d "packages/admin/dist" ]; then
        error "Admin 构建产物不存在，请先运行 yarn build:admin"
    fi

    tcb hosting deploy ./packages/admin/dist /admin -e "$ENV_ID"
    success "管理后台部署完成"
}

# 部署后端服务
deploy_server() {
    info "部署后端服务..."

    if [ ! -d "packages/server/dist" ]; then
        error "Server 构建产物不存在，请先运行 yarn build:server"
    fi

    cd packages/server
    tcb run deploy -e "$ENV_ID"
    cd ../..
    success "后端服务部署完成"
}

# 执行部署
case $TARGET in
    all)
        deploy_h5
        echo ""
        deploy_admin
        echo ""
        deploy_server
        ;;
    h5)
        deploy_h5
        ;;
    admin)
        deploy_admin
        ;;
    server)
        deploy_server
        ;;
esac

echo ""
echo "=========================================="
success "部署完成!"
echo "=========================================="
echo ""
info "查看访问地址:"
tcb hosting detail -e "$ENV_ID" 2>/dev/null || true
