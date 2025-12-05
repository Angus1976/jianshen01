#!/bin/bash

##############################################################################
# TCB 容器型服务部署脚本
# 功能：通过 TCB CLI 创建并部署容器型云托管服务
# 用途：从 GitHub Actions 推送的镜像部署到 TCB
# 使用：bash scripts/deploy-tcb-container.sh
##############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 从 .env.local 加载环境变量
load_env() {
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '#' | xargs)
        print_success "已加载 .env.local"
    else
        print_error ".env.local 文件不存在"
        exit 1
    fi
}

# 检查 TCB CLI 是否安装
check_tcb_cli() {
    if ! command -v tcb &> /dev/null; then
        print_error "未安装 TCB CLI"
        print_info "请运行: npm install -g @cloudbase/cli"
        exit 1
    fi
    print_success "TCB CLI 已安装"
}

# 检查并登录 TCB 环境
check_tcb_login() {
    print_info "检查 TCB 认证状态..."
    
    # 尝试登出旧的会话
    tcb logout 2>/dev/null || true
    
    # 使用 SECRETID 和 SECRETKEY 登录
    tcb login \
        --secretId "$TCB_SECRET_ID" \
        --secretKey "$TCB_SECRET_KEY" \
        2>&1 | grep -q "登录成功\|success" && \
        print_success "TCB 认证成功" || \
        print_error "TCB 认证失败"
}

# 验证部署参数
validate_config() {
    print_info "验证部署配置..."
    
    if [ -z "$TCB_ENV_ID" ]; then
        print_error "TCB_ENV_ID 未设置"
        exit 1
    fi
    
    print_success "环境 ID: $TCB_ENV_ID"
}

# 检查容器镜像是否可用
check_image() {
    local image_name="ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest"
    print_info "检查镜像: $image_name"
    
    # 这里需要通过 TCB 控制台或 API 验证
    # 暂时跳过，假设镜像已推送
    print_success "镜像地址: $image_name"
}

# 创建服务配置文件
create_service_config() {
    local config_file="$1"
    
    print_info "生成服务配置文件..."
    
    cat > "$config_file" << 'EOF'
{
  "serviceName": "rocketbird-api",
  "image": "ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest",
  "port": 8000,
  "cpu": "500m",
  "memory": "1Gi",
  "initialDelaySeconds": 5,
  "timeoutSeconds": 10,
  "periodSeconds": 30,
  "minInstances": 1,
  "maxInstances": 5,
  "envs": [
    {
      "name": "NODE_ENV",
      "value": "production"
    },
    {
      "name": "TCB_ENV_ID",
      "value": "cloud1-4g2aaqb40446a63b"
    },
    {
      "name": "PORT",
      "value": "8000"
    }
  ],
  "healthCheck": {
    "path": "/api/health",
    "initialDelaySeconds": 5,
    "timeoutSeconds": 10,
    "periodSeconds": 30
  }
}
EOF
    
    print_success "服务配置文件已生成: $config_file"
}

# 部署服务的主函数
deploy_service() {
    print_info "开始部署容器型服务..."
    
    local service_name="rocketbird-api"
    local image="ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest"
    local config_file="/tmp/rocketbird-service-config.json"
    
    # 生成配置文件
    create_service_config "$config_file"
    
    print_info "部署服务到环境: $TCB_ENV_ID"
    
    # 使用 TCB CLI 部署
    # 注意: TCB CLI 的容器服务命令可能需要调整
    tcb run \
        --env-id "$TCB_ENV_ID" \
        --service-name "$service_name" \
        --image "$image" \
        --port 8000 \
        --cpu 500m \
        --memory 1Gi \
        --min-instances 1 \
        --max-instances 5 \
        2>&1 | tee /tmp/deploy.log
    
    # 检查部署结果
    if grep -q "成功\|success\|completed" /tmp/deploy.log; then
        print_success "服务部署成功！"
    else
        print_warning "部署命令已发送，请在 TCB 控制台检查状态"
    fi
}

# 验证部署
verify_deployment() {
    print_info "验证部署状态..."
    
    # 使用 TCB CLI 查询服务状态
    tcb run \
        --env-id "$TCB_ENV_ID" \
        --service-name "rocketbird-api" \
        2>&1 | tee /tmp/verify.log || true
    
    print_info "请前往 TCB 控制台检查服务状态"
    print_info "URL: https://console.cloud.tencent.com/tcb/env/$TCB_ENV_ID/service"
}

# 获取服务访问 URL
get_service_url() {
    print_info "获取服务访问地址..."
    
    # 这需要通过 TCB 控制台或 API 获取
    print_info "服务 URL 将在 TCB 控制台显示"
    print_info "服务名: rocketbird-api"
    print_info "镜像: ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest"
}

# 测试服务
test_service() {
    print_info "等待服务启动..."
    sleep 3
    
    # 这里需要实际的服务 URL
    print_warning "请在 TCB 控制台获取服务 URL 后进行测试"
    print_info "测试命令示例:"
    echo "  curl https://<service-url>/api/health"
    echo "  curl https://<service-url>/h5"
}

# 输出总结信息
print_summary() {
    echo ""
    echo "=========================================="
    echo "部署总结"
    echo "=========================================="
    echo "服务名: rocketbird-api"
    echo "镜像: ccr.ccs.tencentyun.com/rocketbird/rocketbird-app:latest"
    echo "端口: 8000"
    echo "CPU: 500m"
    echo "内存: 1Gi"
    echo "最小实例: 1"
    echo "最大实例: 5"
    echo ""
    echo "环境变量:"
    echo "  NODE_ENV=production"
    echo "  TCB_ENV_ID=cloud1-4g2aaqb40446a63b"
    echo "  PORT=8000"
    echo ""
    echo "健康检查:"
    echo "  路径: /api/health"
    echo "  初始延迟: 5s"
    echo "  超时: 10s"
    echo "  间隔: 30s"
    echo ""
    echo "后续步骤:"
    echo "1. 打开 TCB 控制台: https://console.cloud.tencent.com/tcb"
    echo "2. 选择环境: cloud1-4g2aaqb40446a63b"
    echo "3. 查看云托管服务状态"
    echo "4. 获取服务访问 URL"
    echo "5. 测试 API 端点"
    echo "=========================================="
    echo ""
}

# 主流程
main() {
    print_info "=========================================="
    print_info "TCB 容器型服务部署脚本"
    print_info "=========================================="
    print_info "开始部署..."
    echo ""
    
    # 1. 加载环境变量
    load_env
    
    # 2. 检查 TCB CLI
    check_tcb_cli
    
    # 3. 检查 TCB 登录
    check_tcb_login
    
    # 4. 验证配置
    validate_config
    
    # 5. 检查镜像
    check_image
    
    # 6. 部署服务
    deploy_service
    
    # 7. 验证部署
    verify_deployment
    
    # 8. 获取 URL
    get_service_url
    
    # 9. 测试服务
    test_service
    
    # 10. 输出总结
    print_summary
    
    print_success "部署脚本执行完成！"
}

# 运行主流程
main "$@"
