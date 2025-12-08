#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-/user/}
IMAGE_NAME=${IMAGE_NAME:-rocketbird:sim}
CONTAINER_NAME=${CONTAINER_NAME:-rocketbird-prod-sim}
PORT=${PORT:-3001}

info() { echo "[docker-prod-sim] $1"; }

info "清理旧容器"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

info "构建 H5"
yarn workspace @rocketbird/member-h5 build

info "构建镜像"
docker build --no-cache --build-arg BASE_URL="$BASE_URL" -t "$IMAGE_NAME" .

info "启动容器，挂载本地图标，模拟 /user 前缀"
docker run -d --name "$CONTAINER_NAME" -p "$PORT":8000 \
  -e BASE_URL="$BASE_URL" \
  -v "${PWD}/packages/member-h5/static/icons:/app/public/h5/static/icons" \
  -v "${PWD}/packages/member-h5/static/tabbar:/app/public/h5/static/tabbar" \
  "$IMAGE_NAME"

sleep 3

info "1. 容器内静态目录："
docker exec "$CONTAINER_NAME" ls /app/public/h5/static/icons || true
docker exec "$CONTAINER_NAME" ls /app/public/h5/static/tabbar || true

info "2. curl 检查 /user/static/icons/heart.svg"
curl -I "http://localhost:$PORT${BASE_URL}static/icons/heart.svg" || true

info "3. 查看容器日志中静态访问记录"
docker logs "$CONTAINER_NAME" | grep -i "static" || true

info "停止并移除模拟容器"
docker stop "$CONTAINER_NAME" >/dev/null
docker rm "$CONTAINER_NAME" >/dev/null

info "模拟完成，若需要保留容器请注释掉停止命令"
