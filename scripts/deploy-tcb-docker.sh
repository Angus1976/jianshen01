#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

BASE_URL=${BASE_URL:-/user/}
TCB_ENV_ID=${TCB_ENV_ID:-}
TCB_DOCKER_REGISTRY=${TCB_DOCKER_REGISTRY:-}
TCB_IMAGE_NAME=${TCB_IMAGE_NAME:-rocketbird:latest}
TCB_CONTAINER_NAME=${TCB_CONTAINER_NAME:-rocketbird-web}
TCB_CDN_DOMAIN=${TCB_CDN_DOMAIN:-}
TCB_DOCKER_UPDATE_CMD=${TCB_DOCKER_UPDATE_CMD:-}

if [ -z "$TCB_ENV_ID" ]; then
  warn "TCB_ENV_ID 未设置，尝试从 .env 读取"
  if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
  fi
fi

if [ -z "$TCB_ENV_ID" ]; then
  error "请先设置 TCB_ENV_ID (或更新 .env)，否则无法更新容器"
fi

FULL_IMAGE="$TCB_IMAGE_NAME"
if [ -n "$TCB_DOCKER_REGISTRY" ]; then
  FULL_IMAGE="$TCB_DOCKER_REGISTRY/$TCB_IMAGE_NAME"
fi

if [ -n "$TCB_DOCKER_UPDATE_CMD" ]; then
  TCBCMD="$TCB_DOCKER_UPDATE_CMD"
else
  TCBCMD="tcb container update --env-id $TCB_ENV_ID --container $TCB_CONTAINER_NAME --image $FULL_IMAGE --force-rebuild"
fi

info "拉取最新代码"
git pull --ff-only

info "开始构建 Docker 镜像"
docker build --no-cache --progress=plain --build-arg BASE_URL="$BASE_URL" -t "$FULL_IMAGE" .
success "镜像构建完成: $FULL_IMAGE"

info "推送镜像到注册表"
docker push "$FULL_IMAGE"
success "镜像已推送"

info "通知 TCB 更新容器"
if ! command -v tcb &> /dev/null; then
  warn "未检测到 tcb CLI，跳过容器更新 (请保留 $TCBCMD 以便手动执行)"
else
  eval "$TCBCMD"
fi

info "检查镜像中的静态图标"
docker run --rm "$FULL_IMAGE" sh -c 'ls /app/public/h5/static/icons || true'
docker run --rm "$FULL_IMAGE" sh -c 'ls /app/public/h5/static/tabbar || true'

info "验证静态资源在 /user 下是否可访问"
VERIFY_CONTAINER=rocketbird-deploy-test
docker run -d --name "$VERIFY_CONTAINER" -p 3000:8000 -e BASE_URL="$BASE_URL" "$FULL_IMAGE"
sleep 5
curl -I "http://localhost:3000${BASE_URL}static/icons/heart.svg" || true
docker logs "$VERIFY_CONTAINER" | grep -i "static" || warn "未在 logs 中找到 static 关键词"
docker stop "$VERIFY_CONTAINER" >/dev/null

if [ -n "$TCB_CDN_DOMAIN" ]; then
  if command -v tcb &> /dev/null; then
    info "刷新 TCB CDN 缓存"
    tcb cdn refresh --env-id "$TCB_ENV_ID" --domain "$TCB_CDN_DOMAIN"
  else
    warn "无法自动刷新 CDN，请手动运行: tcb cdn refresh --env-id $TCB_ENV_ID --domain $TCB_CDN_DOMAIN"
  fi
else
  warn "未配置 TCB_CDN_DOMAIN，无法自动刷新 CDN 缓存"
fi

success "Docker + TCB 容器部署脚本执行完毕"
